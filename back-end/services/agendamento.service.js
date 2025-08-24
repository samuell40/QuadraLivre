const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const listarAgendamentosService = async (usuarioId) => {
  if (!usuarioId) {
    throw { status: 400, message: 'Usuário não informado.' };
  }

  const agendamentos = await prisma.agendamento.findMany({
    where: { usuarioId },
    include: { quadra: true },
    orderBy: [
      { ano: 'asc' },
      { mes: 'asc' },
      { dia: 'asc' },
      { hora: 'asc' }
    ]
  });

  return agendamentos;
};

const criarAgendamentoService = async ({ usuarioId, dia, mes, ano, hora, duracao = 1, tipo = 'TREINO', quadraId }) => {
  if (!dia || !mes || !ano || !hora || !usuarioId || !quadraId) {
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
      quadraId
    }
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

module.exports = { criarAgendamentoService, listarAgendamentosService, cancelarAgendamentoService  };
