const { queueName } = require('../config/env');
const { getChannel } = require('./client');

async function startConsumer() {
  const channel = await getChannel();
  channel.prefetch(1);

  await channel.consume(queueName, (message) => {
    if (!message) {
      return;
    }

    try {
      const payload = JSON.parse(message.content.toString());
      console.log('Message consumed:', payload);
      channel.ack(message);
    } catch (error) {
      console.error('Invalid message:', error.message);
      channel.nack(message, false, false);
    }
  });
}

module.exports = { startConsumer };

if (require.main === module) {
  startConsumer()
    .then(() => console.log(`Waiting for messages on ${queueName}. Press Ctrl+C to stop.`))
    .catch(async (error) => {
      console.error('Consumer error:', error.message);
      const { close } = require('./client');
      await close();
      process.exitCode = 1;
    });

  process.once('SIGINT', async () => {
    const { close } = require('./client');
    await close();
    process.exit(0);
  });
}