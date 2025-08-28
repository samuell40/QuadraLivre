const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const listarAgendamentosService = async (usuarioId) => {
  if (!usuarioId) {
    throw { status: 400, message: 'Usuário não informado.' };
  }

  const agendamentos = await prisma.agendamento.findMany({
    where: { usuarioId },
    include: { quadra: true, modalidade: true },
    orderBy: [
      { ano: 'asc' },
      { mes: 'asc' },
      { dia: 'asc' },
      { hora: 'asc' }
    ]
  });

  return agendamentos;
};

const listarTodosAgendamentosService = async () => {
  return await prisma.agendamento.findMany({
    include: { quadra: true, usuario: true, modalidade: true },
    orderBy: [
      { ano: 'asc' },
      { mes: 'asc' },
      { dia: 'asc' },
      { hora: 'asc' }
    ]
  });
};

const listarAgendamentosPorQuadraService = async (quadraId) => {
  if (!quadraId) {
    throw { status: 400, message: 'Quadra não informada.' };
  }

  return await prisma.agendamento.findMany({
    where: { quadraId: Number(quadraId) },
    include: { usuario: true, quadra: true, modalidade: true },
    orderBy: [
      { ano: 'asc' },
      { mes: 'asc' },
      { dia: 'asc' },
      { hora: 'asc' }
    ]
  });
};

// Listar agendamentos confirmados por quadra e data
const listarAgendamentosConfirmadosService = async (quadraId, ano, mes, dia) => {
  if (!quadraId) {
    throw { status: 400, message: 'Quadra não informada.' };
  }

  const agendamentos = await prisma.agendamento.findMany({
    where: {
      quadraId,
      status: "Confirmado",
      ano,
      mes,
      dia
    },
    select: {
      id: true,
      hora: true,
      duracao: true,
      modalidade: true
    },
    orderBy: [
      { hora: 'asc' }
    ]
  });

  return agendamentos;
};

const criarAgendamentoService = async ({ usuarioId, dia, mes, ano, hora, duracao = 1, tipo = 'TREINO', quadraId, modalidadeId }) => {
  if (!dia || !mes || !ano || !hora || !usuarioId || !quadraId || !modalidadeId) {
    throw { status: 400, message: 'Campos obrigatórios não preenchidos.' };
  }

  // Verifica conflito no mesmo horário para a mesma quadra
  const conflito = await prisma.agendamento.findFirst({
    where: { dia, mes, ano, hora, quadraId }
  });

  // Verifica se o usuário já tem um agendamento no mesmo horário
  if (conflito) {
    throw { status: 409, message: 'Horário já agendado.' };
  }

  const agendamento = await prisma.agendamento.create({
    data: {
      dia,
      mes,
      ano,
      hora,
      duracao,
      tipo,
      status: 'Pendente',
      usuarioId,
      quadraId,
      modalidadeId
    },
    include: { modalidade: true }
  });

  return agendamento;
};

const cancelarAgendamentoService = async (id) => {
  if (!id) throw { status: 400, message: 'ID do agendamento obrigatório.' };

  const agendamento = await prisma.agendamento.findUnique({ where: { id: Number(id) } });
  if (!agendamento) throw { status: 404, message: 'Agendamento não encontrado.' };

  await prisma.agendamento.delete({ where: { id: Number(id) } });
  return true;
};

const atualizarAgendamentoService = async (id, status) => {
  if (!id || !status) throw { status: 400, message: 'ID e status são obrigatórios.' };

  const agendamento = await prisma.agendamento.findUnique({ where: { id: Number(id) } });
  if (!agendamento) throw { status: 404, message: 'Agendamento não encontrado.' };
  if (agendamento.status !== 'Pendente') throw { status: 400, message: 'Agendamento já foi processado.' };

  const atualizado = await prisma.agendamento.update({
    where: { id: Number(id) },
    data: { status }
  });

  return atualizado;
};

const listarModalidadesPorQuadraService = async (quadraId) => {
  if (!quadraId) throw { status: 400, message: 'Quadra não informada.' };

  try {
    // Prisma faz join na relação N:N
    const quadra = await prisma.quadra.findUnique({
      where: { id: Number(quadraId) },
      include: { modalidades: true }
    });

    if (!quadra) throw { status: 404, message: 'Quadra não encontrada.' };

    return quadra.modalidades;
  } catch (err) {
    console.error('Erro no service de modalidades:', err);
    throw { status: 500, message: 'Erro ao buscar modalidades da quadra.' };
  }
};

module.exports = {
  criarAgendamentoService,
  listarAgendamentosService,
  listarTodosAgendamentosService,
  listarAgendamentosPorQuadraService,
  cancelarAgendamentoService,
  listarAgendamentosConfirmadosService,
  atualizarAgendamentoService,
  listarModalidadesPorQuadraService
};
