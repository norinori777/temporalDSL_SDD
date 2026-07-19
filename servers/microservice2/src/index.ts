import fastify from 'fastify';

const app = fastify({ logger: false });
const port = 3102;

app.get('/', async () => ({
  service: 'microservice2',
  status: 'ok',
}));

app.get('/health', async () => ({
  service: 'microservice2',
  status: 'healthy',
}));

app.listen({ port, host: '0.0.0.0' }).catch((error) => {
  app.log.error(error);
  throw error;
});
