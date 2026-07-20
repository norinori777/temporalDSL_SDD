import fastify from 'fastify';
import { PrismaClient } from '@prisma/client';
import {
  ActionSchemaVersion,
  WorkflowDefinition,
  validateWorkflowDefinition,
} from './workflow-validation';

const app = fastify({ logger: false });
const port = 3001;
const prisma = new PrismaClient();

interface ValidateWorkflowRequest {
  workflow?: WorkflowDefinition;
  availableActions?: ActionSchemaVersion[];
}

app.get('/', async () => ({
  service: 'backend-workflow',
  status: 'ok',
}));

app.get('/health', async () => ({
  service: 'backend-workflow',
  status: 'healthy',
}));

app.get('/action-schemas', async () => {
  const schemas = await prisma.actionSchema.findMany({
    where: { selectable: true },
    orderBy: [{ actionCode: 'asc' }, { version: 'asc' }],
  });

  return schemas.map((schema) => ({
    actionCode: schema.actionCode,
    version: schema.version,
    requestDeclarationYaml: schema.requestDeclarationYaml,
  } satisfies ActionSchemaVersion));
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

  const availableActions = await prisma.actionSchema.findMany({
    where: { selectable: true },
    orderBy: [{ actionCode: 'asc' }, { version: 'asc' }],
  });

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
