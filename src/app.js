const express = require('express');
const { queueName } = require('./config/env');
const { publishMessage } = require('./rabbitmq/producer');

const app = express();

app.use(express.json());

app.get('/health', (request, response) => {
  response.json({ status: 'ok', service: 'learning-api', queue: queueName });
});

app.post('/messages', async (request, response, next) => {
  try {
    const { message } = request.body;

    if (typeof message !== 'string' || message.trim() === '') {
      return response.status(400).json({ error: 'message must be a non-empty string' });
    }

    const payload = {
      message: message.trim(),
      createdAt: new Date().toISOString()
    };

    await publishMessage(payload);
    return response.status(202).json({ queued: true, payload });
  } catch (error) {
    return next(error);
  }
});

app.use((error, request, response, next) => {
  console.error(error.message);
  response.status(500).json({ error: 'RabbitMQ is unavailable' });
});

module.exports = app;