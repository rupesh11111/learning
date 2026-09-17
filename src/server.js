const app = require('./app');
const { port } = require('./config/env');
const { startConsumer } = require('./rabbitmq/consumer');
const { close } = require('./rabbitmq/client');

async function startServer() {
  await startConsumer();

  const server = app.listen(port, () => {
    console.log(`API listening on http://localhost:${port}`);
  });

  const shutdown = async () => {
    server.close(async () => {
      await close();
      process.exit(0);
    });
  };

  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
}

startServer().catch((error) => {
  console.error('Failed to start server:', error.message);
  process.exitCode = 1;
});