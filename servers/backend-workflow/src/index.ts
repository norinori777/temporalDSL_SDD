import fastify from 'fastify';
import { PrismaClient } from '@prisma/client';
import {
  ActionSchemaVersion,
  WorkflowDefinition as LegacyWorkflowDefinition,
  validateWorkflowDefinition,
} from './workflow-validation';
import {
  createActionDefinition,
  listActionDefinitions,
  listSelectableActionDefinitions,
  updateActionDefinitionSelectable,
  validateActionDefinitionForCreate,
} from './action-definition-store';
import { ActionDefinitionInput } from './action-definition-validation';
import { listWorkflowDefinitions, listWorkflowVersions, getWorkflowVersion, createWorkflowVersion, validateWorkflowDefinitionForPersist } from './workflow-definition-store';
import { WorkflowDefinitionInput as BuilderWorkflowDefinitionInput } from './workflow-definition-validation';

const app = fastify({ logger: false });
const port = 3001;
const prisma = new PrismaClient();

interface ValidateWorkflowRequest {
  workflow?: LegacyWorkflowDefinition;
  availableActions?: ActionSchemaVersion[];
}

interface ActionDefinitionRequest extends ActionDefinitionInput {
  id?: number;
}

interface ActionDefinitionSelectableRequest {
  selectable?: boolean;
}

interface WorkflowBuilderRequest extends BuilderWorkflowDefinitionInput {}

app.get('/', async () => ({
  service: 'backend-workflow',
  status: 'ok',
}));

app.get('/health', async () => ({
  service: 'backend-workflow',
  status: 'healthy',
}));

app.get('/action-schemas', async () => {
  const schemas = await listSelectableActionDefinitions(prisma);

  return schemas.map((schema) => ({
    id: schema.id,
    actionCode: schema.actionCode,
    version: schema.version,
    displayName: schema.displayName,
    requestDeclarationYaml: schema.requestDeclarationYaml,
    selectable: schema.selectable,
    createdAt: schema.createdAt,
    updatedAt: schema.updatedAt,
  } satisfies ActionSchemaVersion));
});

app.get('/action-definitions', async () => {
  const definitions = await listActionDefinitions(prisma);

  return definitions;
});

app.post('/action-definitions/validate', async (request, reply) => {
  const body = request.body as ActionDefinitionRequest;

  const result = await validateActionDefinitionForCreate(prisma, body);

  if (!result.valid) {
    return reply.status(400).send(result);
  }

  return reply.send(result);
});

app.post('/action-definitions', async (request, reply) => {
  const body = request.body as ActionDefinitionRequest;
  const validation = await validateActionDefinitionForCreate(prisma, body);

  if (!validation.valid) {
    return reply.status(400).send(validation);
  }

  const createdDefinition = await createActionDefinition(prisma, body);
  return reply.status(201).send(createdDefinition);
});

app.patch('/action-definitions/:id', async (request, reply) => {
  const params = request.params as { id: string };
  const body = request.body as ActionDefinitionSelectableRequest;
  const parsedId = Number(params.id);

  if (!Number.isInteger(parsedId)) {
    return reply.status(400).send({
      valid: false,
      issues: [
        {
          code: 'ACTION_DEFINITION_ID_INVALID',
          message: 'id は数値で指定してください。',
          field: 'id',
        },
      ],
    });
  }

  if (typeof body.selectable !== 'boolean') {
    return reply.status(400).send({
      valid: false,
      issues: [
        {
          code: 'SELECTABLE_INVALID',
          message: 'selectable は true または false である必要があります。',
          field: 'selectable',
        },
      ],
    });
  }

  const updatedDefinition = await updateActionDefinitionSelectable(prisma, parsedId, body.selectable);

  if (!updatedDefinition) {
    return reply.status(404).send({
      valid: false,
      issues: [
        {
          code: 'ACTION_DEFINITION_NOT_FOUND',
          message: '指定された Action 定義が見つかりません。',
          field: 'id',
        },
      ],
    });
  }

  return reply.send(updatedDefinition);
});

app.get('/workflow-definitions', async () => {
  const definitions = await listWorkflowDefinitions(prisma);
  return definitions;
});

app.get('/workflow-definitions/:workflowDefinitionId/versions', async (request, reply) => {
  const params = request.params as { workflowDefinitionId: string };
  const parsedWorkflowDefinitionId = Number(params.workflowDefinitionId);

  if (!Number.isInteger(parsedWorkflowDefinitionId)) {
    return reply.status(400).send({
      valid: false,
      issues: [
        {
          code: 'WORKFLOW_DEFINITION_ID_INVALID',
          message: 'workflowDefinitionId は数値で指定してください。',
          targetType: 'workflow',
        },
      ],
    });
  }

  const versions = await listWorkflowVersions(prisma, parsedWorkflowDefinitionId);
  return versions;
});

app.get('/workflow-definitions/:workflowDefinitionId/versions/:version', async (request, reply) => {
  const params = request.params as { workflowDefinitionId: string; version: string };
  const parsedWorkflowDefinitionId = Number(params.workflowDefinitionId);
  const parsedVersion = Number(params.version);

  if (!Number.isInteger(parsedWorkflowDefinitionId) || !Number.isInteger(parsedVersion)) {
    return reply.status(400).send({
      valid: false,
      issues: [
        {
          code: 'WORKFLOW_VERSION_INVALID',
          message: 'workflowDefinitionId と version は数値で指定してください。',
          targetType: 'workflow',
        },
      ],
    });
  }

  const versionRecord = await getWorkflowVersion(prisma, parsedWorkflowDefinitionId, parsedVersion);

  if (!versionRecord) {
    return reply.status(404).send({
      valid: false,
      issues: [
        {
          code: 'WORKFLOW_VERSION_NOT_FOUND',
          message: '指定されたワークフロー版が見つかりません。',
          targetType: 'workflow',
        },
      ],
    });
  }

  return versionRecord;
});

app.post('/workflow-definitions/validate', async (request, reply) => {
  const body = request.body as WorkflowBuilderRequest;
  const result = await validateWorkflowDefinitionForPersist(prisma, body);

  if (!result.valid) {
    return reply.status(400).send(result);
  }

  return reply.send(result);
});

app.post('/workflow-definitions', async (request, reply) => {
  const body = request.body as WorkflowBuilderRequest;
  const validation = await validateWorkflowDefinitionForPersist(prisma, body);

  if (!validation.valid) {
    return reply.status(400).send(validation);
  }

  const savedVersion = await createWorkflowVersion(prisma, body);
  return reply.status(201).send(savedVersion);
});

app.post('/workflow/validate', async (request, reply) => {
  const body = request.body as ValidateWorkflowRequest;

  if (!body.workflow) {
    return reply.status(400).send({
      valid: false,
      issues: [
        {
          code: 'WORKFLOW_REQUIRED',
          message: 'workflow が必要です。',
        },
      ],
    });
  }

  const availableActions =
    body.availableActions ??
    (await prisma.actionSchema.findMany({
      where: { selectable: true },
      orderBy: [{ actionCode: 'asc' }, { version: 'asc' }],
    })).map((schema) => ({
      actionCode: schema.actionCode,
      version: schema.version,
      requestDeclarationYaml: schema.requestDeclarationYaml,
    }));

  const result = validateWorkflowDefinition(body.workflow, availableActions);
  return reply.send(result);
});

app.post('/workflow/validate-db', async (request, reply) => {
  const body = request.body as ValidateWorkflowRequest;

  if (!body.workflow) {
    return reply.status(400).send({
      valid: false,
      issues: [
        {
          code: 'WORKFLOW_REQUIRED',
          message: 'workflow が必要です。',
        },
      ],
    });
  }

  const availableActions = await listSelectableActionDefinitions(prisma);

  const result = validateWorkflowDefinition(
    body.workflow,
    availableActions.map((schema) => ({
      actionCode: schema.actionCode,
      version: schema.version,
      requestDeclarationYaml: schema.requestDeclarationYaml,
    })),
  );

  return reply.send({
    ...result,
    loadedSchemas: availableActions.length,
  });
});

app.listen({ port, host: '0.0.0.0' }).catch((error) => {
  app.log.error(error);
  throw error;
});
