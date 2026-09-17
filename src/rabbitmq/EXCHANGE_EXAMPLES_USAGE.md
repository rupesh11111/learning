# `exchange-examples.js` Usage Guide

This guide explains how to run the RabbitMQ exchange examples from:

```text
src/rabbitmq/exchange-examples.js
```

Available exchange types:

- `direct`
- `fanout`
- `topic`
- `headers`

## 1. Start RabbitMQ

Open a terminal in the project root:

```powershell
cd C:\Users\DELL\OneDrive\Desktop\learning
docker compose up -d
```

Check the container:

```powershell
docker compose ps
```

## 2. Command format

The `package.json` script is:

```json
"exchange": "node src/rabbitmq/exchange-examples.js"
```

General command format:

```powershell
npm run exchange -- <exchange-type> <action> ...
```

Actions:

- `publish`: send a message
- `consume`: receive messages

Start the consumer in one terminal first, then publish from a second terminal.

## Direct Exchange

A direct exchange routes a message only when the routing key exactly matches the binding key.

Terminal 1:

```powershell
npm run exchange -- direct consume direct-queue info
```

Terminal 2:

```powershell
npm run exchange -- direct publish info "Direct message"
```

The producer key and consumer binding key are both `info`, so the message is delivered.

This message does not match the `info` binding:

```powershell
npm run exchange -- direct publish error "Error message"
```

Flow:

```text
Producer -- info --> direct exchange -- info binding --> direct-queue
```

## Fanout Exchange

A fanout exchange ignores the routing key and broadcasts the message to every bound queue.

Terminal 1:

```powershell
npm run exchange -- fanout consume fanout-queue
```

Terminal 2:

```powershell
npm run exchange -- fanout publish "Broadcast message"
```

Fanout does not require a routing key.

Common uses:

- Notifications
- Broadcast messages
- Sending one event to multiple services

## Topic Exchange

A topic exchange routes messages using routing-key patterns.

Pattern rules:

- `*` matches exactly one word.
- `#` matches zero or more words.

Terminal 1:

```powershell
npm run exchange -- topic consume topic-queue "order.*"
```

Terminal 2:

```powershell
npm run exchange -- topic publish order.created "Order created"
```

`order.created` matches the `order.*` pattern.

For multiple order levels:

```powershell
npm run exchange -- topic consume all-orders "order.#"
npm run exchange -- topic publish order.item.created "Order item created"
```

## Headers Exchange

A headers exchange routes messages using message headers instead of routing keys.

Terminal 1:

```powershell
npm run exchange -- headers consume headers-queue '{"format":"pdf"}'
```

Terminal 2:

```powershell
npm run exchange -- headers publish '{"format":"pdf"}' "PDF report"
```

The header matches, so the message is delivered.

This message does not match the `format=pdf` binding:

```powershell
npm run exchange -- headers publish '{"format":"excel"}' "Excel report"
```

The current code uses `x-match: all`, which means every binding header must match.

## Expected output

Producer terminal:

```text
Published on learning.direct with key "info"
```

Consumer terminal:

```text
Listening on learning.direct -> direct-queue
Consumed from direct-queue: {
  message: 'Direct message',
  createdAt: '...'
}
```

Stop a consumer with `Ctrl+C`.

## Exchange comparison

| Exchange | Routing method | Routing key | Common use |
|---|---|---|---|
| Default | Queue name | Queue name | Simple queue |
| Direct | Exact key match | Required | Exact event routing |
| Fanout | All bound queues | Ignored | Broadcast |
| Topic | Pattern match | Required | Event-based routing |
| Headers | Header match | Ignored | Metadata routing |

## Default producer vs. exchange example

Normal producer:

```powershell
npm run producer -- "Hello RabbitMQ"
```

This uses the default exchange and the queue name.

Named exchange example:

```powershell
npm run exchange -- direct publish info "Direct message"
```

This uses a named exchange, routing key, queue, and binding.

## Stop RabbitMQ

```powershell
docker compose down
```

RabbitMQ dashboard:

```text
http://localhost:15672
```

Credentials are configured in the `.env` file.
