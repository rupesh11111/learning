require('dotenv').config();

module.exports = {
  port: Number(process.env.PORT) || 3000,
  rabbitmqUrl: process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672',
  queueName: process.env.RABBITMQ_QUEUE || 'learning_queue',
  kafkaBrokers: (process.env.KAFKA_BROKERS || 'localhost:29092').split(','),
  kafkaTopic: process.env.KAFKA_TOPIC || 'learning.events',
  kafkaGroupId: process.env.KAFKA_GROUP_ID || 'learning-consumer-group'
};