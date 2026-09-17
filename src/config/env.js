require('dotenv').config();

module.exports = {
  port: Number(process.env.PORT) || 3000,
  rabbitmqUrl: process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672',
  queueName: process.env.RABBITMQ_QUEUE || 'learning_queue'
};