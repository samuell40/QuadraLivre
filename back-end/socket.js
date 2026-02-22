const { Server } = require('socket.io');

let io = null;

function paraIdValido(valor) {
  const numero = Number(valor);
  if (!Number.isInteger(numero) || numero <= 0) return null;
  return numero;
}

function salaCampeonato(campeonatoId) {
  return `campeonato:${campeonatoId}`;
}

function iniciarSocket(server) {
  if (io) return io;

  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
    }
  });

  io.on('connection', (socket) => {
    socket.on('campeonato:inscrever', ({ campeonatoId } = {}) => {
      const id = paraIdValido(campeonatoId);
      if (!id) return;
      socket.join(salaCampeonato(id));
    });

    socket.on('campeonato:desinscrever', ({ campeonatoId } = {}) => {
      const id = paraIdValido(campeonatoId);
      if (!id) return;
      socket.leave(salaCampeonato(id));
    });
  });

  return io;
}

function emitirAtualizacaoCampeonato(payload = {}) {
  if (!io) return;

  const campeonatoId = paraIdValido(payload.campeonatoId);
  if (!campeonatoId) return;

  const faseId = paraIdValido(payload.faseId);
  const rodadaId = paraIdValido(payload.rodadaId);

  io.to(salaCampeonato(campeonatoId)).emit('campeonato:atualizado', {
    ...payload,
    campeonatoId,
    faseId,
    rodadaId,
    atualizadoEm: new Date().toISOString()
  });
}

module.exports = {
  iniciarSocket,
  emitirAtualizacaoCampeonato
};
