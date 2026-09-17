const { queueName } = require('../config/env');
const { getChannel } = require('./client');

async function publishMessage(payload) {
  const channel = await getChannel();
  const message = Buffer.from(JSON.stringify(payload));

  channel.sendToQueue(queueName, message, {
    persistent: true,
    contentType: 'application/json'
  });

  return payload;
}

module.exports = { publishMessage };

if (require.main === module) {
  const message = process.argv.slice(2).join(' ') || 'Hello from the RabbitMQ producer';
  const { close } = require('./client');

  publishMessage({ message, createdAt: new Date().toISOString() })
    .then(() => console.log(`Sent: ${message}`))
    .then(close)
    .catch(async (error) => {
      console.error('Producer error:', error.message);
      await close();
      process.exitCode = 1;
    });
}