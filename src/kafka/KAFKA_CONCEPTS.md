# Kafka Learning Concepts

This document explains the main Apache Kafka concepts used by this learning project.

## 1. What is Kafka?

Apache Kafka is a distributed event-streaming platform. Applications use Kafka to publish, store, and process streams of messages.

Common use cases:

- Event-driven applications
- Service-to-service communication
- Activity tracking
- Log collection
- Data pipelines
- Real-time analytics
- Audit events

Kafka stores messages in topics and lets consumers read them using offsets. It is more than a temporary queue.

## 2. Kafka architecture

```text
Producer -> Kafka broker -> Topic -> Partition -> Consumer group -> Consumer
```

- **Producer:** creates and sends messages.
- **Broker:** Kafka server that stores and serves messages.
- **Topic:** named stream of related messages.
- **Partition:** ordered section of a topic.
- **Consumer:** reads and processes messages.
- **Consumer group:** set of consumers working together.
- **Offset:** message position inside a partition.

Current project files:

```text
src/kafka/client.js
src/kafka/producer.js
src/kafka/consumer.js
```

## 3. Topic

A topic is a named stream of messages. This project uses:

```text
learning.events
```

Other examples could be:

```text
user.created
order.events
payment.completed
application.logs
```

The producer sends messages to a topic, and consumers subscribe to that topic.

## 4. Partitions

Kafka divides a topic into partitions:

```text
learning.events
├── partition 0
├── partition 1
└── partition 2
```

A partition is an ordered sequence:

```text
partition 0: message 0 -> message 1 -> message 2
```

Kafka guarantees ordering inside one partition, but not one global order across all partitions.

Partitions provide:

- Parallel processing
- Better throughput
- Horizontal scaling
- Distribution of work

The Docker setup creates three default partitions for newly created topics.

## 5. Message keys and partition selection

A producer can send a message with a key:

```js
await producer.send({
  topic: 'learning.events',
  messages: [{
    key: 'user-101',
    value: JSON.stringify(payload)
  }]
});
```

Messages with the same key normally go to the same partition. This helps preserve the order of events for one user or order.

The current learning producer does not use a key:

```js
messages: [{ value: JSON.stringify(payload) }]
```

## 6. Offset

Every message in a partition has an offset:

```text
partition 0: offset 0 -> offset 1 -> offset 2
```

An offset is the position of a message. A consumer group uses offsets to remember which messages it has processed.

Kafka normally does not delete a message immediately after it is read. Messages remain available according to the topic retention policy.

## 7. Consumer groups

A consumer group is a set of consumers that work together:

```text
Topic with 3 partitions
        |
        +--> Consumer A -> partition 0
        +--> Consumer B -> partition 1
        +--> Consumer C -> partition 2
```

Inside one group, a partition is assigned to only one active consumer at a time.

If there are more consumers than partitions, extra consumers stay idle:

```text
3 partitions + 5 consumers = 2 consumers idle
```

Different group IDs receive independent copies of the topic messages:

```text
learning.events
       |
       +--> group-a reads the events
       +--> group-b also reads the events
```

The current group ID is configured in `.env`:

```env
KAFKA_GROUP_ID=learning-consumer-group
```

## 8. `fromBeginning`

The consumer subscribes like this:

```js
await consumer.subscribe({
  topic: kafkaTopic,
  fromBeginning: true
});
```

For a new group, this allows KafkaJS to read available earlier messages. For an existing group, Kafka uses that group's saved offsets.

To test with a new group:

```env
KAFKA_GROUP_ID=another-learning-group
```

## 9. Message serialization

The producer starts with a JavaScript object:

```js
{
  message: 'Hello Kafka',
  createdAt: '...'
}
```

It serializes the object:

```js
JSON.stringify(payload)
```

The consumer converts it back:

```js
JSON.parse(message.value.toString())
```

Flow:

```text
JavaScript object -> JSON string -> Kafka message value
Kafka message value -> string -> JavaScript object
```

## 10. RabbitMQ vs Kafka

RabbitMQ flow:

```text
Producer -> Exchange -> Binding -> Queue -> Consumer
```

Kafka flow:

```text
Producer -> Topic -> Partition -> Consumer group
```

RabbitMQ is commonly used for queue-based tasks, flexible exchange routing, acknowledgments, and work distribution.

Kafka is commonly used for high-throughput event streaming, replayable messages, partitions, and multiple independent consumer groups.

Main difference:

- RabbitMQ normally removes an acknowledged message from a queue.
- Kafka keeps a message in the topic and stores each group's position as an offset.

## 11. Current project configuration

The Kafka settings are in `.env`:

```env
KAFKA_BROKERS=localhost:29092
KAFKA_TOPIC=learning.events
KAFKA_GROUP_ID=learning-consumer-group
```

The Kafka client creates the connection:

```js
const kafka = new Kafka({
  clientId: 'learning-app',
  brokers: ['localhost:29092']
});
```

## 12. Run the example

Start Kafka:

```powershell
docker compose up -d kafka
```

Wait until the container is running, then start the consumer:

```powershell
npm run kafka:consumer
```

In another terminal, send a message:

```powershell
npm run kafka:producer -- "Hello Kafka"
```

Expected consumer output:

```text
Kafka message from partition 0: {
  message: 'Hello Kafka',
  createdAt: '...'
}
```

## 13. Startup errors during the first run

On the first Docker start, Kafka may still be initializing while the consumer tries to connect. You may temporarily see errors such as:

```text
ECONNRESET
The group coordinator is not available
This server does not host this topic-partition
```

This usually means the broker or topic is not ready yet. Check the container:

```powershell
docker compose ps kafka
docker compose logs kafka --tail 30
```

When the container is running, restart the consumer:

```powershell
npm run kafka:consumer
```

The producer's first successful message can automatically create the configured topic.

## 14. Production concepts

This is a learning setup with one broker. Production systems usually add:

- Multiple brokers
- Replication factor greater than one
- Authentication and TLS
- Schema validation with Avro, Protobuf, or JSON Schema
- Retry and dead-letter topics
- Monitoring and alerting
- Explicit partition keys
- Idempotent producers
- Consumer lag monitoring
- Carefully designed retention settings

Learn the single-broker flow first, then add these concepts one at a time.
