const amqp = require('amqplib');
const { rabbitmqUrl } = require('../config/env');

const examples = {
    direct: {
        exchange: 'learning.direct',
        type: 'direct',
        queue: 'learning.direct.queue',
        key: 'info'
    },
    fanout: {
        exchange: 'learning.fanout',
        type: 'fanout',
        queue: 'learning.fanout.queue',
        key: ''
    },
    topic: {
        exchange: 'learning.topic',
        type: 'topic',
        queue: 'learning.topic.queue',
        key: 'order.*'
    },
    headers: {
        exchange: 'learning.headers',
        type: 'headers',
        queue: 'learning.headers.queue',
        key: ''
    }
};

function getExample(name) {
    const example = examples[name];

    if (!example) {
        throw new Error(`Unknown exchange type: ${name}`);
    }

    return example;
}

async function publish(name, value, message, headers = {}) {
    const example = getExample(name);
    const connection = await amqp.connect(rabbitmqUrl);
    const channel = await connection.createChannel();

    await channel.assertExchange(example.exchange, example.type, { durable: true });
    const payload = Buffer.from(JSON.stringify({ message, createdAt: new Date().toISOString() }));

    channel.publish(example.exchange, value, payload, {
        persistent: true,
        contentType: 'application/json',
        headers
    });

    console.log(`Published on ${example.exchange} with key "${value}"`);
    await channel.close();
    await connection.close();
}

async function consume(name, queueName, bindingValue, bindingHeaders = {}) {
    const example = getExample(name);
    const connection = await amqp.connect(rabbitmqUrl);
    const channel = await connection.createChannel();
    const queue = queueName || example.queue;

    await channel.assertExchange(example.exchange, example.type, { durable: true });
    await channel.assertQueue(queue, { durable: true });

    if (example.type === 'headers') {
        await channel.bindQueue(queue, example.exchange, '', {
            'x-match': 'all',
            ...bindingHeaders
        });
    } else {
        await channel.bindQueue(queue, example.exchange, bindingValue || example.key);
    }

    channel.prefetch(1);
    await channel.consume(queue, (message) => {
        if (!message) {
            return;
        }

        console.log(`Consumed from ${queue}:`, JSON.parse(message.content.toString()));
        channel.ack(message);
    });

    console.log(`Listening on ${example.exchange} -> ${queue}`);

    const shutdown = async () => {
        await channel.close();
        await connection.close();
        process.exit(0);
    };

    process.once('SIGINT', shutdown);
    process.once('SIGTERM', shutdown);
}

async function main() {
    const [, , name, action, ...args] = process.argv;
    console.log(name, action, args);

    if (action === 'publish') {
        if (name === 'headers') {
            await publish(name, '', args.slice(1).join(' '), JSON.parse(args[0] || '{}'));
        } else if (name === 'fanout') {
            await publish(name, '', args.join(' '));
        } else {
            await publish(name, args[0], args.slice(1).join(' '));
        }

        return;
    }

    if (action === 'consume') {
        if (name === 'headers') {
            await consume(name, args[0], '', JSON.parse(args[1] || '{}'));
        } else {
            await consume(name, args[0], args[1]);
        }

        return;
    }

    throw new Error('Use: <direct|fanout|topic|headers> <publish|consume> ...');
}

main().catch((error) => {
    console.error('Exchange example error:', error.message);
    process.exitCode = 1;
});