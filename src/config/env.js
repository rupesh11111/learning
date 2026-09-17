require('dotenv').config();

module.exports = {
  port: Number(process.env.PORT) || 3000,
  rabbitmqUrl: process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672',
  queueName: process.env.RABBITMQ_QUEUE || 'learning_queue',
  kafkaBrokers: (process.env.KAFKA_BROKERS || 'localhost:29092').split(','),
  kafkaTopic: process.env.KAFKA_TOPIC || 'learning.events',
  kafkaGroupId: process.env.KAFKA_GROUP_ID || 'learning-consumer-group',
  grpcPort: Number(process.env.GRPC_PORT) || 50051,
  grpcAuthToken: process.env.GRPC_AUTH_TOKEN || 'development-token',
  grpcTls: process.env.GRPC_TLS === 'true',
  grpcTlsCert: process.env.GRPC_TLS_CERT,
  grpcTlsKey: process.env.GRPC_TLS_KEY,
  grpcTlsCa: process.env.GRPC_TLS_CA
};