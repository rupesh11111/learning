const { Kafka } = require('kafkajs');
const { kafkaBrokers } = require('../config/env');

const kafka = new Kafka({
  clientId: 'learning-app',
  brokers: kafkaBrokers
});

module.exports = { kafka };