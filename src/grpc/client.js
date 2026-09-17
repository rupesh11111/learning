const grpc = require('@grpc/grpc-js');
const { learning } = require('./server');
const { grpcAuthToken, grpcPort } = require('../config/env');

const client = new learning.LearningService(`localhost:${grpcPort}`, grpc.credentials.createInsecure());
const metadata = new grpc.Metadata();
metadata.set('authorization', `Bearer ${grpcAuthToken}`);
metadata.set('x-request-id', 'demo-client-1');
const deadline = new Date(Date.now() + 3000);

client.echo({ message: 'unary hello' }, metadata, { deadline }, (error, response) => {
  if (error) return console.error('unary error:', error.code, error.details);
  console.log('unary:', response);
  const replies = client.lotsOfReplies({ message: 'server stream' }, metadata, { deadline });
  replies.on('data', (reply) => console.log('server stream:', reply));
  replies.on('error', (streamError) => console.error('server stream error:', streamError.code, streamError.details));
  replies.on('end', () => {
    const route = client.recordRoute(metadata, { deadline }, (routeError, summary) => {
      if (routeError) return console.error('client stream error:', routeError.code, routeError.details);
      console.log('client stream:', summary);
      const notes = client.routeChat(metadata, { deadline });
      notes.on('data', (note) => console.log('bidirectional:', note));
      notes.on('error', (noteError) => console.error('bidirectional error:', noteError.code, noteError.details));
      notes.on('end', () => client.close());
      notes.write({ location: { latitude: 1, longitude: 2 }, message: 'bidi hello' });
      notes.end();
    });
    route.on('error', (routeError) => console.error('client stream error:', routeError.code, routeError.details));
    route.write({ latitude: 10, longitude: 20 });
    route.write({ latitude: 12, longitude: 23 });
    route.end();
  });
});

