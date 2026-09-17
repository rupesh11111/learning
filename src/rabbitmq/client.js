const amqp = require('amqplib');
const { rabbitmqUrl, queueName } = require('../config/env');

let connection;
let channel;

async function getChannel() {
  if (channel) {
    console.log("have channel");
    return channel;
  }
  console.log("no channel");

  connection = await amqp.connect(rabbitmqUrl);
  channel = await connection.createChannel();
  await channel.assertQueue(queueName, { durable: true });

  connection.on('close', () => {
    connection = undefined;
    channel = undefined;
  });

  return channel;
}

async function close() {
  if (channel) {
    await channel.close();
  }

  if (connection) {
    await connection.close();
  }

  channel = undefined;
  connection = undefined;
}

module.exports = { getChannel, close };