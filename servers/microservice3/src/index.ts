import fastify from 'fastify';

const app = fastify({ logger: false });
const port = 3103;

app.get('/', async () => ({
  service: 'microservice3',
  status: 'ok',
}));

app.get('/health', async () => ({
  service: 'microservice3',
  status: 'healthy',
}));

app.listen({ port, host: '0.0.0.0' }).catch((error) => {
  app.log.error(error);
  throw error;
});
