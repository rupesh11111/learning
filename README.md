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