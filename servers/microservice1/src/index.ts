import fastify from 'fastify';

const app = fastify({ logger: false });
const port = 3101;

app.get('/', async () => ({
  service: 'microservice1',
  status: 'ok',
}));

app.get('/health', async () => ({
  service: 'microservice1',
  status: 'healthy',
}));

app.listen({ port, host: '0.0.0.0' }).catch((error) => {
  app.log.error(error);
  throw error;
});
