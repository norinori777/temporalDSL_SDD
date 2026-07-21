import { PrismaClient } from '@prisma/client';
import {
  WorkflowActionDefinition,
  WorkflowDefinitionInput,
  WorkflowDefinitionValidationResult,
  validateWorkflowDefinitionInput,
} from './workflow-definition-validation';

export interface WorkflowDefinitionSummaryRecord {
  workflowDefinitionId: number;
  name: string;
  description: string;
  currentVersion: number;
  updatedAt: Date;
}

export interface WorkflowNodeRecord {
  id: number;
  nodeKey: string;
  nodeType: string;
  label: string;
  actionDefinitionId: number | null;
  positionX: number;
  positionY: number;
}

export interface WorkflowEdgeRecord {
  id: number;
  fromNodeKey: string;
  toNodeKey: string;
  label: string;
}

export interface WorkflowVersionRecord {
  workflowDefinitionId: number;
  workflowVersionId: number;
  version: number;
  name: string;
  description: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  nodes: WorkflowNodeRecord[];
  edges: WorkflowEdgeRecord[];
}

interface PrismaWorkflowVersionWithRelations {
  id: number;
  workflowDefinitionId: number;
  version: number;
  name: string;
  description: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  nodes: Array<{
    id: number;
    nodeKey: string;
    nodeType: string;
    label: string;
    actionDefinitionId: number | null;
    positionX: number;
    positionY: number;
  }>;
  edges: Array<{
    id: number;
    fromNodeKey: string;
    toNodeKey: string;
    label: string;
  }>;
}

const WORKFLOW_NAME_DUPLICATE = 'WORKFLOW_NAME_DUPLICATE';

export async function listWorkflowDefinitions(
  prisma: PrismaClient,
): Promise<WorkflowDefinitionSummaryRecord[]> {
  const records = await prisma.workflowDefinition.findMany({
    orderBy: [{ name: 'asc' }],
  });

  return records.map((record) => ({
    workflowDefinitionId: record.id,
    name: record.name,
    description: record.description,
    currentVersion: record.currentVersion,
    updatedAt: record.updatedAt,
  }));
}

export async function listWorkflowVersions(
  prisma: PrismaClient,
  workflowDefinitionId: number,
): Promise<WorkflowVersionRecord[]> {
  const records = await prisma.workflowVersion.findMany({
    where: { workflowDefinitionId },
    orderBy: [{ version: 'asc' }],
    include: {
      nodes: true,
      edges: true,
    },
  });

  return records.map(mapWorkflowVersionRecord);
}

export async function getWorkflowVersion(
  prisma: PrismaClient,
  workflowDefinitionId: number,
  version: number,
): Promise<WorkflowVersionRecord | null> {
  const record = await prisma.workflowVersion.findFirst({
    where: { workflowDefinitionId, version },
    include: {
      nodes: true,
      edges: true,
    },
  });

  return record ? mapWorkflowVersionRecord(record as PrismaWorkflowVersionWithRelations) : null;
}

export async function validateWorkflowDefinitionForPersist(
  prisma: PrismaClient,
  input: WorkflowDefinitionInput,
): Promise<WorkflowDefinitionValidationResult> {
  const availableActions = await prisma.actionSchema.findMany({
    where: { selectable: true },
    select: {
      id: true,
      actionCode: true,
      version: true,
      displayName: true,
      selectable: true,
    },
    orderBy: [{ actionCode: 'asc' }, { version: 'asc' }],
  });

  const existingNames = await prisma.workflowDefinition.findMany({
    select: { id: true, name: true },
  });

  return validateWorkflowDefinitionInput(input, availableActions as WorkflowActionDefinition[], existingNames);
}

export async function createWorkflowVersion(
  prisma: PrismaClient,
  input: WorkflowDefinitionInput,
): Promise<WorkflowVersionRecord> {
  const normalizedName = input.name.trim();
  const normalizedDescription = input.description?.trim() ?? '';

  const result = await prisma.$transaction(async (transaction) => {
    let workflowDefinition = input.workflowDefinitionId
      ? await transaction.workflowDefinition.findUnique({
          where: { id: input.workflowDefinitionId },
        })
      : await transaction.workflowDefinition.findUnique({
          where: { name: normalizedName },
        });

    if (!workflowDefinition) {
      workflowDefinition = await transaction.workflowDefinition.create({
        data: {
          name: normalizedName,
          description: normalizedDescription,
        },
      });
    } else if (workflowDefinition.name !== normalizedName || workflowDefinition.description !== normalizedDescription) {
      workflowDefinition = await transaction.workflowDefinition.update({
        where: { id: workflowDefinition.id },
        data: {
          name: normalizedName,
          description: normalizedDescription,
        },
      });
    }

    const lastVersion = await transaction.workflowVersion.findFirst({
      where: { workflowDefinitionId: workflowDefinition.id },
      orderBy: [{ version: 'desc' }],
      select: { version: true },
    });

    const nextVersion = (lastVersion?.version ?? 0) + 1;

    const versionRecord = await transaction.workflowVersion.create({
      data: {
        workflowDefinitionId: workflowDefinition.id,
        version: nextVersion,
        name: normalizedName,
        description: normalizedDescription,
      },
    });

    for (const node of input.nodes) {
      await transaction.workflowNode.create({
        data: {
          workflowVersionId: versionRecord.id,
          nodeKey: node.nodeKey.trim(),
          nodeType: node.nodeType,
          label: node.label.trim(),
          actionDefinitionId: node.actionDefinitionId ?? null,
          positionX: node.positionX ?? 0,
          positionY: node.positionY ?? 0,
        },
      });
    }

    for (const edge of input.edges) {
      await transaction.workflowEdge.create({
        data: {
          workflowVersionId: versionRecord.id,
          fromNodeKey: edge.fromNodeKey.trim(),
          toNodeKey: edge.toNodeKey.trim(),
          label: edge.label?.trim() ?? '',
        },
      });
    }

    await transaction.workflowDefinition.update({
      where: { id: workflowDefinition.id },
      data: { currentVersion: nextVersion },
    });

    const savedVersion = await transaction.workflowVersion.findUniqueOrThrow({
      where: { id: versionRecord.id },
      include: {
        nodes: true,
        edges: true,
      },
    });

    return mapWorkflowVersionRecord(savedVersion as PrismaWorkflowVersionWithRelations);
  });

  return result;
}

function mapWorkflowVersionRecord(
  record: PrismaWorkflowVersionWithRelations,
): WorkflowVersionRecord {
  return {
    workflowDefinitionId: record.workflowDefinitionId,
    workflowVersionId: record.id,
    version: record.version,
    name: record.name,
    description: record.description,
    status: record.status,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    nodes: record.nodes.map((node) => ({
      id: node.id,
      nodeKey: node.nodeKey,
      nodeType: node.nodeType,
      label: node.label,
      actionDefinitionId: node.actionDefinitionId,
      positionX: node.positionX,
      positionY: node.positionY,
    })),
    edges: record.edges.map((edge) => ({
      id: edge.id,
      fromNodeKey: edge.fromNodeKey,
      toNodeKey: edge.toNodeKey,
      label: edge.label,
    })),
  };
}