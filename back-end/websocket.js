const { WebSocketServer } = require("ws");

let wss; 

function initWebSocket(server) {
  wss = new WebSocketServer({ server, path: "/placares" });

  wss.on("connection", (ws) => {
    //console.log("Novo cliente conectado ao placar!");

    ws.on("close", () => {
      //console.log(" Cliente desconectado");
    });
  });
}

// função auxiliar para enviar para todos os clientes
function broadcast(data) {
  if (!wss) return;
  const msg = JSON.stringify(data);

  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(msg);
    }
  });
}

module.exports = { initWebSocket, broadcast };
