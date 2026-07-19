import fastify from 'fastify';

const app = fastify({ logger: false });
const port = 3001;

app.get('/', async () => ({
  service: 'backend-workflow',
  status: 'ok',
}));

app.get('/health', async () => ({
  service: 'backend-workflow',
  status: 'healthy',
}));

app.listen({ port, host: '0.0.0.0' }).catch((error) => {
  app.log.error(error);
  throw error;
});
