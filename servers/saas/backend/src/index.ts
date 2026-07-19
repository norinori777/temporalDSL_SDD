import fastify from 'fastify';

const app = fastify({ logger: false });
const port = 3201;

app.get('/', async () => ({
  service: 'saas-backend',
  status: 'ok',
}));

app.get('/health', async () => ({
  service: 'saas-backend',
  status: 'healthy',
}));

app.listen({ port, host: '0.0.0.0' }).catch((error) => {
  app.log.error(error);
  throw error;
});
