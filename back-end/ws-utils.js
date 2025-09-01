let wss;

function setServer(server) {
  wss = server;
}

function broadcast(data) {
  if (!wss) return;
  const msg = JSON.stringify(data);

  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(msg);
    }
  });
}

module.exports = { setServer, broadcast };