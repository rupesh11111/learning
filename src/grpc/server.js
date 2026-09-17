const fs = require('fs');
const path = require('path');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const { grpcPort, grpcTls, grpcTlsCert, grpcTlsKey, grpcTlsCa } = require('../config/env');
const service = require('./service');

const packageDefinition = protoLoader.loadSync(path.join(__dirname, 'proto', 'learning.proto'), { keepCase: true, longs: String, enums: String, defaults: true, oneofs: true });
const learning = grpc.loadPackageDefinition(packageDefinition).learning;

function credentials() {
  if (!grpcTls) return grpc.ServerCredentials.createInsecure();
  if (!grpcTlsCert || !grpcTlsKey) throw new Error('GRPC_TLS_CERT and GRPC_TLS_KEY are required when GRPC_TLS=true');
  const roots = grpcTlsCa ? fs.readFileSync(grpcTlsCa) : null;
  return grpc.ServerCredentials.createSsl(roots, [{ cert_chain: fs.readFileSync(grpcTlsCert), private_key: fs.readFileSync(grpcTlsKey) }]);
}

function createGrpcServer() {
  const server = new grpc.Server();
  server.addService(learning.LearningService.service, service);
  return server;
}

if (require.main === module) {
  const server = createGrpcServer();
  server.bindAsync(`0.0.0.0:${grpcPort}`, credentials(), (error, port) => {
    if (error) throw error;
    console.log(`gRPC listening on localhost:${port}`);
  });
}

module.exports = { createGrpcServer, learning, credentials };