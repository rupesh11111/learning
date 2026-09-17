# Learning Express RabbitMQ Project

An Express API that publishes messages to RabbitMQ and consumes them in the background.

## Run

Install dependencies:

```powershell
npm install
```

Start RabbitMQ:

```powershell
docker compose up -d
```

Start the API and consumer:

```powershell
npm start
```

The API runs on `http://localhost:3000`.

## Endpoints

Health check:

```powershell
Invoke-RestMethod http://localhost:3000/health
```

Publish a message:

```powershell
$body = @{ message = "Hello RabbitMQ" } | ConvertTo-Json
Invoke-RestMethod http://localhost:3000/messages -Method Post -ContentType "application/json" -Body $body
```

The API consumer logs the received message in the server terminal.

RabbitMQ dashboard: `http://localhost:15672` using `guest` / `guest`.

Stop RabbitMQ:

```powershell
docker compose down
```

## Exchange Examples

The normal `producer` uses RabbitMQ's default exchange. The examples below show the four common exchange types.

### Direct exchange

Routes only when the routing key exactly matches the binding key.

Terminal 1:

```powershell
npm run exchange -- direct consume direct-queue info
```

Terminal 2:

```powershell
npm run exchange -- direct publish info "Direct message"
```

### Fanout exchange

Broadcasts a message to every queue bound to the exchange. The routing key is ignored.

Terminal 1:

```powershell
npm run exchange -- fanout consume fanout-queue
```

Terminal 2:

```powershell
npm run exchange -- fanout publish "Broadcast message"
```

### Topic exchange

Routes using patterns. `*` matches one word and `#` matches zero or more words.

Terminal 1:

```powershell
npm run exchange -- topic consume topic-queue "order.*"
```

Terminal 2:

```powershell
npm run exchange -- topic publish order.created "Order created"
```

### Headers exchange

Routes using message headers instead of routing keys.

Terminal 1:

```powershell
npm run exchange -- headers consume headers-queue '{"format":"pdf"}'
```

Terminal 2:

```powershell
npm run exchange -- headers publish '{"format":"pdf"}' "PDF report"
```

For all examples, start RabbitMQ first with `docker compose up -d`.

## Kafka Learning Example

Kafka has a separate producer and consumer example:

```powershell
docker compose up -d kafka
```

Terminal 1:

```powershell
npm run kafka:consumer
```

Terminal 2:

```powershell
npm run kafka:producer -- "Hello Kafka"
```

Read the complete guide in [src/kafka/KAFKA_USAGE.md](src/kafka/KAFKA_USAGE.md).

## gRPC Learning Example

The gRPC example includes unary, server streaming, client streaming, and bidirectional streaming RPCs. It also demonstrates deadlines, timeouts, metadata, status-code error handling, middleware authentication, and optional TLS.

Install dependencies and start the gRPC server:

```powershell
npm install
npm run grpc
```

In another terminal, run all four RPC examples:

```powershell
npm run grpc:client
```

The client sends `authorization: Bearer $env:GRPC_AUTH_TOKEN` and `x-request-id` metadata. The default development token is `development-token`; set `GRPC_AUTH_TOKEN` in `.env` to change it. Every client call uses a three-second deadline. Invalid messages return `INVALID_ARGUMENT`, missing or invalid auth returns `UNAUTHENTICATED`, and expired calls return `DEADLINE_EXCEEDED`.

Set `GRPC_TLS=true` plus `GRPC_TLS_CERT` and `GRPC_TLS_KEY` to run the server with TLS. The protocol definition is in [src/grpc/proto/learning.proto](src/grpc/proto/learning.proto), and the middleware is in [src/grpc/middleware.js](src/grpc/middleware.js).