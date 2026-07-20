import fastify from 'fastify';
import {
  ActionSchemaVersion,
  WorkflowDefinition,
  validateWorkflowDefinition,
} from './workflow-validation';

const app = fastify({ logger: false });
const port = 3001;

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

  const result = validateWorkflowDefinition(body.workflow, body.availableActions ?? []);
  return reply.send(result);
});

app.listen({ port, host: '0.0.0.0' }).catch((error) => {
  app.log.error(error);
  throw error;
});
