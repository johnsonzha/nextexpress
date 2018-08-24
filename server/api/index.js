const publicApi = require('./public');

function api(server, serverURl) {
  server.use('/api/v2.0', publicApi(serverURl));
}

module.exports = api;
