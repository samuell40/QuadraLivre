const { WebSocketServer } = require("ws");
const { listarPartidasAtivas } = require("./services/partida.service"); 
const { setServer } = require("./ws-utils"); 

function initWebSocket(server) {
  const wss = new WebSocketServer({ server, path: "/placares" });

  setServer(wss); 

  wss.on("connection", async (ws) => {
    console.log("Novo cliente conectado ao placar!");

    try {
      const partidasAtivas = await listarPartidasAtivas();
      ws.send(JSON.stringify({
        tipo: "snapshotPartidas",
        partidas: partidasAtivas
      }));
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

module.exports = { initWebSocket };