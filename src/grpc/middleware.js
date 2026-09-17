const grpc = require('@grpc/grpc-js');
const { grpcAuthToken } = require('../config/env');

function metadataValue(metadata, key) {
  const values = metadata.get(key);
  return values.length > 0 ? String(values[0]) : undefined;
}

function withMiddleware(handler, options = {}) {
  return async (call, callback) => {
    const requestId = metadataValue(call.metadata, 'x-request-id') || `grpc-${Date.now()}`;
    const authorization = metadataValue(call.metadata, 'authorization');
    if (options.auth !== false && authorization !== `Bearer ${grpcAuthToken}`) {
      callback({ code: grpc.status.UNAUTHENTICATED, message: 'valid bearer token is required' });
      return;
    }
    if (call.getDeadline() !== Infinity && Date.now() > call.getDeadline()) {
      callback({ code: grpc.status.DEADLINE_EXCEEDED, message: 'request deadline exceeded' });
      return;
    }
    call.requestId = requestId;
    try { await handler(call, callback); } catch (error) {
      callback({ code: error.code || grpc.status.INTERNAL, message: error.message || 'internal error' });
    }
  };
}

module.exports = { withMiddleware };