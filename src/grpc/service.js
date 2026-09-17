const grpc = require('@grpc/grpc-js');
const { withMiddleware } = require('./middleware');

function validateMessage(message) {
  if (typeof message !== 'string' || message.trim() === '') {
    const error = new Error('message must be a non-empty string');
    error.code = grpc.status.INVALID_ARGUMENT;
    throw error;
  }
}

function echo(call, callback) {
  validateMessage(call.request.message);
  callback(null, { message: call.request.message.trim(), request_id: call.requestId });
}

function lotsOfReplies(call) {
  validateMessage(call.request.message);
  for (let index = 1; index <= 3; index += 1) {
    if (call.cancelled) return;
    call.write({ message: `${call.request.message} #${index}`, request_id: call.requestId });
  }
  call.end();
}

function recordRoute(call, callback) {
  let pointCount = 0;
  let distance = 0;
  let previous;
  call.on('data', (point) => {
    pointCount += 1;
    if (previous) distance += Math.abs(point.latitude - previous.latitude) + Math.abs(point.longitude - previous.longitude);
    previous = point;
  });
  call.on('end', () => callback(null, { point_count: pointCount, distance }));
  call.on('error', () => callback({ code: grpc.status.CANCELLED, message: 'client cancelled stream' }));
}

function routeChat(call) {
  call.on('data', (note) => { if (!call.cancelled) call.write(note); });
  call.on('end', () => call.end());
}

module.exports = {
  echo: withMiddleware(echo),
  lotsOfReplies: withMiddleware(lotsOfReplies),
  recordRoute: withMiddleware(recordRoute),
  routeChat: withMiddleware(routeChat)
};