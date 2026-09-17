const { kafka } = require('./client');
const { kafkaTopic, kafkaGroupId } = require('../config/env');

let activeConsumer;

async function startConsumer() {
  const consumer = kafka.consumer({ groupId: kafkaGroupId });
  activeConsumer = consumer;
  await consumer.connect();
  await consumer.subscribe({ topic: kafkaTopic, fromBeginning: true });

  console.log(`Listening to Kafka topic ${kafkaTopic} as ${kafkaGroupId}`);

  await consumer.run({
    eachMessage: async ({ partition, message }) => {
      const payload = JSON.parse(message.value.toString());
      console.log(`Kafka message from partition ${partition}:`, payload);
    }
  });

  return consumer;
}

module.exports = { startConsumer };

if (require.main === module) {
  startConsumer()
    .catch((error) => {
      console.error('Kafka consumer error:', error.message);
      process.exitCode = 1;
    });

  const shutdown = async () => {
    if (activeConsumer) {
      await activeConsumer.disconnect();
    }

    process.exit(0);
  };

  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
}