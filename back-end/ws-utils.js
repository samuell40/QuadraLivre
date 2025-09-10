let wss;

/**
 * Define o servidor WebSocket
 * @param {WebSocketServer} server 
 */
function setServer(server) {
  wss = server;
}

/**
 * @param {Object} data 
 */
function broadcast(data) {
  if (!wss) return;
  const msg = JSON.stringify(data);

  wss.clients.forEach(client => {
    if (client.readyState === client.OPEN) {
      client.send(msg);
    }
  });
}

/**

 * @param {Object} data 
 * @param {Function} filterFn -
 */

function broadcast(data, filterFn) {
  if (!wss) return;
  const msg = JSON.stringify(data);

  wss.clients.forEach(client => {
    if (client.readyState === client.OPEN && filterFn(client)) {
      client.send(msg);
    }
  });
}

module.exports = { setServer, broadcast};