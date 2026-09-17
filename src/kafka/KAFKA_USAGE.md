# Kafka Usage Guide

This project contains a learning-level Apache Kafka producer and consumer using `kafkajs`.

Files:

```text
src/kafka/client.js
src/kafka/producer.js
src/kafka/consumer.js
```

## RabbitMQ vs Kafka

RabbitMQ and Kafka are both messaging systems, but their models are different:

```text
RabbitMQ: Producer -> Exchange -> Queue -> Consumer
Kafka:     Producer -> Topic -> Partition -> Consumer group
```

Kafka stores messages in a topic for a period of time. Consumers track their position using offsets.

## 1. Start Kafka with Docker

From the project root:

```powershell
cd C:\Users\DELL\OneDrive\Desktop\learning
docker compose up -d kafka
```

Check the container:

```powershell
docker compose ps kafka
```

The local Kafka broker is available at:

```text
localhost:29092
```

The topic used by this project is configured in `.env`:

```env
KAFKA_TOPIC=learning.events
```

Kafka creates the topic automatically when the producer sends its first message.

## 2. Start the consumer

Open Terminal 1:

```powershell
npm run kafka:consumer
```

Expected output:

```text
Listening to Kafka topic learning.events as learning-consumer-group
```

The consumer uses the group ID from `.env`:

```env
KAFKA_GROUP_ID=learning-consumer-group
```

## 3. Send a message

Open Terminal 2:

```powershell
npm run kafka:producer -- "Hello Kafka"
```

Expected producer output:

```text
Kafka message sent: {
  message: 'Hello Kafka',
  createdAt: '...'
}
```

Consumer output:

```text
Kafka message from partition 0: {
  message: 'Hello Kafka',
  createdAt: '...'
}
```

Stop the consumer with `Ctrl+C`.

## How the code works

### Kafka client

`src/kafka/client.js` creates a Kafka client:

```js
const kafka = new Kafka({
  clientId: 'learning-app',
  brokers: ['localhost:29092']
});
```

The broker address comes from `KAFKA_BROKERS` in `.env`.

### Producer

`src/kafka/producer.js`:

1. Connects a producer to Kafka.
2. Converts the message to JSON.
3. Sends it to the configured topic.
4. Disconnects the producer.

```js
await producer.send({
  topic: kafkaTopic,
  messages: [{ value: JSON.stringify(payload) }]
});
```

### Consumer

`src/kafka/consumer.js`:

1. Connects with a consumer group ID.
2. Subscribes to the topic.
3. Reads messages from the beginning when appropriate.
4. Processes each message.

```js
await consumer.subscribe({
  topic: kafkaTopic,
  fromBeginning: true
});
```

## Topics

A topic is a named stream of messages:

```text
learning.events
```

The producer sends messages to the topic, and consumers subscribe to the topic.

## Partitions

A topic can have multiple partitions:

```text
learning.events
├── partition 0
├── partition 1
└── partition 2
```

Partitions allow Kafka to process messages in parallel. The current Docker setup creates three default partitions.

The consumer output shows the partition:

```text
Kafka message from partition 0: ...
```

Messages in the same partition preserve their order.

## Consumer groups

A consumer group is a set of consumers that work together:

```text
Topic with 3 partitions
        |
        +--> Consumer A
        +--> Consumer B
        +--> Consumer C
```

Within one group, a partition is assigned to only one active consumer at a time.

If two consumers use different group IDs, both groups receive their own copy of the topic messages.

Change the group in `.env` to test this:

```env
KAFKA_GROUP_ID=another-learning-group
```

Then start another consumer. It will read independently from the first group.

## Offsets

Kafka records the position of a consumer in a partition using an offset:

```text
partition 0: message 0, message 1, message 2
                              ^
                           offset
```

The consumer group controls which messages have already been read. `fromBeginning: true` allows a new group to read available earlier messages.

## RabbitMQ commands still work

Kafka was added alongside RabbitMQ. Existing RabbitMQ commands remain unchanged:

```powershell
docker compose up -d rabbitmq
npm start
npm run producer -- "Hello RabbitMQ"
```

To start both services:

```powershell
docker compose up -d
```

## Environment variables

Copy the example file when setting up a new machine:

```powershell
Copy-Item .env.example .env
```

Kafka variables:

```env
KAFKA_BROKERS=localhost:29092
KAFKA_TOPIC=learning.events
KAFKA_GROUP_ID=learning-consumer-group
```

## Stop Kafka

```powershell
docker compose stop kafka
```

To stop all project services:

```powershell
docker compose down
```

To remove containers and stored Kafka/RabbitMQ data too:

```powershell
docker compose down -v
```
