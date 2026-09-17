const { kafka } = require('./client');
const { kafkaTopic } = require('../config/env');

async function sendMessage(message) {
  const producer = kafka.producer();
  await producer.connect();

  try {
    const payload = {
      message,
      createdAt: new Date().toISOString()
    };

    await producer.send({
      topic: kafkaTopic,
      messages: [{ value: JSON.stringify(payload) }]
    });

    return payload;
  } finally {
    await producer.disconnect();
  }
}

module.exports = { sendMessage };

if (require.main === module) {
  const message = process.argv.slice(2).join(' ') || 'Hello from the Kafka producer';

  sendMessage(message)
    .then((payload) => console.log('Kafka message sent:', payload))
    .catch((error) => {
      console.error('Kafka producer error:', error.message);
      process.exitCode = 1;
    });
}