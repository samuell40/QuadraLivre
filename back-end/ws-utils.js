let wss;

/**
 * Define o servidor WebSocket
 * @param {WebSocketServer} server 
 */
function setServer(server) {
  wss = server;
}

/**
 * Envia mensagem para todos os clientes conectados
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

module.exports = { setServer, broadcast };