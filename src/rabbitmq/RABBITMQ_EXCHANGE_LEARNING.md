# RabbitMQ Exchanges - Complete Learning Notes

## 1. RabbitMQ ka basic flow

```text
Producer -> Exchange -> Binding -> Queue -> Consumer
```

- **Producer:** message bhejta hai.
- **Exchange:** message ko decide karta hai ki kis queue me bhejna hai.
- **Binding:** exchange aur queue ke beech rule/connection hota hai.
- **Queue:** messages ko temporarily store karti hai.
- **Consumer:** queue se message receive/process karta hai.
- **Routing key:** message ko route karne ke liye naam/key hoti hai.

---

## 2. Default exchange

Current normal producer me ye code use hota hai:

```js
channel.sendToQueue(queueName, message, {
  persistent: true,
  contentType: 'application/json'
});
```

RabbitMQ internally default exchange (`""`) use karta hai. Default exchange me queue ka naam hi routing key hota hai.

```text
Producer
   |
   | default exchange
   | routing key = learning_queue
   v
learning_queue
   |
   v
Consumer
```

Isme manually exchange ya binding create karne ki zarurat nahi hoti.

### Default exchange kab use karein?

- Simple one-queue project
- Learning/demo project
- Direct producer-to-queue messaging
- Jab routing ki zarurat nahi ho

---

## 3. Direct exchange

Direct exchange exact routing key match karta hai.

```text
Producer -- key: info --> direct exchange
                              |
                         binding: info
                              |
                              v
                         direct queue
```

Agar binding key `info` hai, to sirf `info` routing key wala message queue me jayega.

### Consumer

```powershell
npm run exchange -- direct consume direct-queue info
```

Meaning:

- exchange type: `direct`
- queue: `direct-queue`
- binding key: `info`

### Producer

```powershell
npm run exchange -- direct publish info "Direct message"
```

Yahan routing key `info` hai, isliye message receive hoga.

### Use cases

- Log levels: `info`, `error`, `warning`
- Specific event type
- Exact service routing

---

## 4. Fanout exchange

Fanout exchange routing key ko ignore karta hai aur message ko exchange se bound har queue me broadcast karta hai.

```text
                         +--> queue 1
                         |
Producer -> fanout exchange +--> queue 2
                         |
                         +--> queue 3
```

### Consumer

```powershell
npm run exchange -- fanout consume fanout-queue
```

### Producer

```powershell
npm run exchange -- fanout publish "Broadcast message"
```

Fanout me routing key ki zarurat nahi hoti.

### Use cases

- Notifications
- All services ko same event bhejna
- Broadcast announcements
- Cache invalidation

---

## 5. Topic exchange

Topic exchange routing key ke pattern ke basis par message route karta hai.

Routing key words se banti hai aur words dot (`.`) se separate hote hain.

Examples:

```text
order.created
order.cancelled
payment.success
payment.failed
```

Special patterns:

- `*` exactly ek word match karta hai.
- `#` zero ya multiple words match karta hai.

```text
order.*       -> order.created, order.cancelled
order.#       -> order.created, order.item.created
*.failed      -> payment.failed, login.failed
```

### Consumer

```powershell
npm run exchange -- topic consume topic-queue "order.*"
```

### Producer

```powershell
npm run exchange -- topic publish order.created "Order created"
```

`order.created` pattern `order.*` se match karta hai.

### Use cases

- Event-driven architecture
- Domain events
- Orders, payments, users ke events
- Multiple related event types

---

## 6. Headers exchange

Headers exchange routing key use nahi karta. Ye message ke headers ke basis par route karta hai.

```text
Producer
   |
   | headers: format=pdf
   v
Headers exchange
   |
   | binding headers: format=pdf
   v
Queue
```

### Consumer

```powershell
npm run exchange -- headers consume headers-queue '{"format":"pdf"}'
```

### Producer

```powershell
npm run exchange -- headers publish '{"format":"pdf"}' "PDF report"
```

Header match hone par message receive hoga.

### `x-match`

Current code me:

```js
{
  'x-match': 'all',
  ...bindingHeaders
}
```

- `all`: saare headers match hone chahiye.
- `any`: koi ek header match ho to message route hoga.

### Use cases

- Format-based routing
- Version-based routing
- Region/tenant-based routing
- Complex metadata routing

---

## 7. Current exchange example code ka flow

File:

```text
src/rabbitmq/exchange-examples.js
```

### Exchange declare karna

```js
await channel.assertExchange(
  example.exchange,
  example.type,
  { durable: true }
);
```

- Exchange create hota hai agar pehle se nahi hai.
- `durable: true` exchange ko RabbitMQ restart ke baad bhi rakhta hai.

### Queue declare karna

```js
await channel.assertQueue(queue, { durable: true });
```

### Queue ko exchange se bind karna

Direct, fanout aur topic:

```js
await channel.bindQueue(
  queue,
  example.exchange,
  bindingValue
);
```

Headers:

```js
await channel.bindQueue(queue, example.exchange, '', {
  'x-match': 'all',
  format: 'pdf'
});
```

### Message publish karna

```js
channel.publish(
  exchangeName,
  routingKey,
  message,
  {
    persistent: true,
    contentType: 'application/json'
  }
);
```

### Message consume karna

```js
await channel.consume(queue, (message) => {
  if (!message) {
    return;
  }

  const payload = JSON.parse(message.content.toString());
  console.log(payload);
  channel.ack(message);
});
```

`ack` ka matlab RabbitMQ ko batana ki message successfully process ho gaya.

---

## 8. Sab exchange types ka short comparison

| Exchange | Routing kaise hoti hai? | Routing key | Common use |
|---|---|---|---|
| Default | Queue name se | Queue name | Simple queue |
| Direct | Exact key match | Required | Logs/events |
| Fanout | Sab bound queues | Ignore | Broadcast |
| Topic | Pattern match | Required | Event system |
| Headers | Headers match | Ignore | Metadata routing |

---

## 9. Project run karna

RabbitMQ start karo:

```powershell
docker compose up -d
```

Normal Express API + consumer start karo:

```powershell
npm start
```

Normal default-exchange producer:

```powershell
npm run producer -- "Hello RabbitMQ"
```

Exchange examples ke liye `npm run exchange` use karo.

---

## 10. Important learning point

Default exchange simple shortcut hai:

```text
sendToQueue(queueName, message)
```

Baaki exchange types me routing flexible hoti hai:

```text
publish(exchangeName, routingKey, message)
```

Industry me exchange tab useful hota hai jab:

- Multiple queues hon.
- Ek message ko multiple services ko bhejna ho.
- Routing rules chahiye hon.
- Events ko category/pattern ke basis par distribute karna ho.
- Retry queues ya dead-letter queues add karni hon.

Single queue ke simple project me default exchange kaafi hota hai.
