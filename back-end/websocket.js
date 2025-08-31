const { WebSocketServer } = require("ws");
const { listarPartidasAtivas } = require("./services/partida.service"); // ajuste o caminho conforme necessário

let wss;

function initWebSocket(server) {
  wss = new WebSocketServer({ server, path: "/placares" });

  wss.on("connection", async (ws) => {
    console.log("Novo cliente conectado ao placar!");

    // Envia partidas ativas imediatamente ao conectar
    try {
      const partidasAtivas = await listarPartidasAtivas();
      ws.send(JSON.stringify({ tipo: "visibilidadeAtualizada", placares: partidasAtivas }));
    } catch (err) {
      console.error("Erro ao enviar partidas ativas via WebSocket:", err);
    }

    ws.on("close", () => {
      console.log("Cliente desconectado do WebSocket");
    });

    ws.on("error", (err) => {
      console.error("Erro no WebSocket:", err);
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