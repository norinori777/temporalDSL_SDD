import { PrismaClient } from '@prisma/client';
import {
  ActionDefinitionInput,
  ActionDefinitionRecord,
  ActionDefinitionValidationResult,
  validateActionDefinitionInput,
} from './action-definition-validation';

export interface PrismaActionSchemaRecord {
  id: number;
  actionCode: string;
  version: string;
  displayName: string;
  requestDeclarationYaml: string;
  selectable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export function mapActionSchemaRecord(record: PrismaActionSchemaRecord): ActionDefinitionRecord {
  return {
    id: record.id,
    actionCode: record.actionCode,
    version: record.version,
    displayName: record.displayName,
    requestDeclarationYaml: record.requestDeclarationYaml,
    selectable: record.selectable,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export async function listActionDefinitions(prisma: PrismaClient): Promise<ActionDefinitionRecord[]> {
  const records = await prisma.actionSchema.findMany({
    orderBy: [{ actionCode: 'asc' }, { version: 'asc' }],
  });

  return records.map((record) => mapActionSchemaRecord(record as PrismaActionSchemaRecord));
}

export async function listSelectableActionDefinitions(
  prisma: PrismaClient,
): Promise<ActionDefinitionRecord[]> {
  const records = await prisma.actionSchema.findMany({
    where: { selectable: true },
    orderBy: [{ actionCode: 'asc' }, { version: 'asc' }],
  });

  return records.map((record) => mapActionSchemaRecord(record as PrismaActionSchemaRecord));
}

export async function validateActionDefinitionForCreate(
  prisma: PrismaClient,
  input: ActionDefinitionInput,
): Promise<ActionDefinitionValidationResult> {
  const existingDefinitions = await prisma.actionSchema.findMany({
    select: { id: true, actionCode: true, version: true },
  });

  return validateActionDefinitionInput(input, existingDefinitions);
}

export async function createActionDefinition(
  prisma: PrismaClient,
  input: ActionDefinitionInput,
): Promise<ActionDefinitionRecord> {
  const createdRecord = await prisma.actionSchema.create({
    data: {
      actionCode: input.actionCode.trim(),
      version: input.version.trim(),
      displayName: input.displayName.trim(),
      requestDeclarationYaml: input.requestDeclarationYaml,
      selectable: input.selectable,
    },
  });

  return mapActionSchemaRecord(createdRecord as PrismaActionSchemaRecord);
}

export async function updateActionDefinitionSelectable(
  prisma: PrismaClient,
  id: number,
  selectable: boolean,
): Promise<ActionDefinitionRecord | null> {
  const existingRecord = await prisma.actionSchema.findUnique({ where: { id } });

  if (!existingRecord) {
    return null;
  }

  const updatedRecord = await prisma.actionSchema.update({
    where: { id },
    data: { selectable },
  });

  return mapActionSchemaRecord(updatedRecord as PrismaActionSchemaRecord);
}