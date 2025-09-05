const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { enviarEmailStatusAgendamento } = require('./email.service');
const { startOfWeek, endOfWeek } = require('date-fns')

const listarAgendamentosService = async (usuarioId) => {
  if (!usuarioId) {
    throw { status: 400, message: 'Usuário não informado.' };
  }

  const agendamentos = await prisma.agendamento.findMany({
    where: { usuarioId },
    include: {
      quadra: true,
      modalidade: true,
      usuario: {
        include: {
          times: {
            include: { time: true }
          }
        }
      }
    },
    orderBy: [
      { ano: 'asc' },
      { mes: 'asc' },
      { dia: 'asc' },
      { hora: 'asc' }
    ]
  });

  return agendamentos.map(a => ({
    ...a,
    duracao: a.duracao ?? 1
  }));
};

const listarTodosAgendamentosService = async () => {
  const agendamentos = await prisma.agendamento.findMany({
    include: {
      quadra: true,
      modalidade: true,
      usuario: {
        include: {
          times: {
            include: { time: true }
          }
        }
      }
    },
    orderBy: [
      { ano: 'asc' },
      { mes: 'asc' },
      { dia: 'asc' },
      { hora: 'asc' }
    ]
  });

  return agendamentos.map(a => ({
    ...a,
    duracao: a.duracao ?? 1
  }));
};

const listarAgendamentosPorQuadraService = async (quadraId) => {
  if (!quadraId) {
    throw { status: 400, message: 'Quadra não informada.' };
  }

  const agendamentos = await prisma.agendamento.findMany({
    where: { quadraId: Number(quadraId) },
    include: {
      quadra: true,
      modalidade: true,
      usuario: {
        include: {
          times: {
            include: { time: true }
          }
        }
      }
    },
    orderBy: [
      { ano: 'asc' },
      { mes: 'asc' },
      { dia: 'asc' },
      { hora: 'asc' }
    ]
  });

  return agendamentos.map(a => ({
    ...a,
    duracao: a.duracao ?? 1
  }));
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
    include: {
      modalidade: true,
      usuario: {
        include: {
          times: {
            include: { time: true }
          }
        }
      }
    },
    orderBy: [{ hora: 'asc' }]
  });

  return agendamentos.map(a => ({
    ...a,
    duracao: a.duracao ?? 1
  }));
};

const criarAgendamentoService = async ({
  usuarioId,
  dia,
  mes,
  ano,
  hora,
  duracao = 1,
  tipo = "TREINO",
  quadraId,
  modalidadeId,
  timeId,
}) => {
  if (
    !dia ||
    !mes ||
    !ano ||
    !hora ||
    !usuarioId ||
    !quadraId ||
    !modalidadeId ||
    !timeId
  ) {
    throw { status: 400, message: "Campos obrigatórios não preenchidos." };
  }

  // Valida a existência da quadra, modalidade e time
  const [quadra, modalidade, time] = await Promise.all([
    prisma.quadra.findUnique({ where: { id: Number(quadraId) } }),
    prisma.modalidade.findUnique({ where: { id: Number(modalidadeId) } }),
    prisma.time.findUnique({ where: { id: Number(timeId) } }),
  ]);

  if (!quadra) throw { status: 400, message: "Quadra não existe." };
  if (!modalidade) throw { status: 400, message: "Modalidade não existe." };
  if (!time) throw { status: 400, message: "Time não existe." };

  // Verifica agendamentos do mesmo time na semana
  const dataAgendamento = new Date(ano, mes - 1, dia);
  const inicioSemana = startOfWeek(dataAgendamento, { weekStartsOn: 1 });
  const fimSemana = endOfWeek(dataAgendamento, { weekStartsOn: 1 });

  const agendamentosSemana = await prisma.agendamento.count({
    where: {
      timeId,
      status: { in: ["Pendente", "Confirmado"] },
      // compara intervalo da semana
      ano: {
        gte: inicioSemana.getFullYear(),
        lte: fimSemana.getFullYear(),
      },
      AND: Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(inicioSemana);
        d.setDate(inicioSemana.getDate() + i);
        return {
          dia: d.getDate(),
          mes: d.getMonth() + 1,
          ano: d.getFullYear(),
        };
      }),
    },
  });

  if (agendamentosSemana >= 2) {
    throw {
      status: 400,
      message: "Este time já possui 2 agendamentos nesta semana.",
    };
  }

  // Checa conflito de horários na quadra
  const conflito = await prisma.agendamento.findFirst({
    where: {
      dia,
      mes,
      ano,
      quadraId,
      hora: {
        gte: hora,
        lt: hora + duracao,
      },
    },
  });

  if (conflito) {
    throw { status: 409, message: "Horário já agendado." };
  }

  // Cria do agendamento
  const agendamento = await prisma.agendamento.create({
    data: {
      dia,
      mes,
      ano,
      hora,
      duracao,
      tipo,
      status: "Pendente",
      usuarioId,
      quadraId,
      modalidadeId,
      timeId,
    },
    include: {
      modalidade: true,
      usuario: {
        include: {
          times: { include: { time: true } },
        },
      },
      time: true,
    },
  });

  return {
    ...agendamento,
    duracao: agendamento.duracao ?? 1,
  };
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

  const agendamento = await prisma.agendamento.findUnique({
    where: { id: Number(id) },
    include: { usuario: true, quadra: true, modalidade: true }
  });

  if (!agendamento) throw { status: 404, message: 'Agendamento não encontrado.' };
  if (agendamento.status !== 'Pendente') throw { status: 400, message: 'Agendamento já foi processado.' };

  const atualizado = await prisma.agendamento.update({
    where: { id: Number(id) },
    data: { status },
    include: { usuario: true, quadra: true, modalidade: true }
  });

  try {
    await enviarEmailStatusAgendamento(atualizado);
  } catch (err) {
    console.error('Erro ao enviar email de status do agendamento:', err);
  }

  return {
    ...atualizado,
    duracao: atualizado.duracao ?? 1
  };
};

const listarModalidadesPorQuadraService = async (quadraId) => {
  if (!quadraId) throw { status: 400, message: 'Quadra não informada.' };

  try {
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

const listarAgendamentosPorTimeService = async (timeId, inicio, fim) => {
  if (!timeId || !inicio || !fim) {
    throw { status: 400, message: 'Parâmetros obrigatórios não informados.' };
  }

  const dataInicio = new Date(inicio);
  const dataFim = new Date(fim);

  const agendamentos = await prisma.agendamento.findMany({
    where: {
      timeId: Number(timeId),
      AND: [
        {
          OR: [
            { ano: { gt: dataInicio.getFullYear() } },
            {
              ano: dataInicio.getFullYear(),
              OR: [
                { mes: { gt: dataInicio.getMonth() + 1 } },
                {
                  mes: dataInicio.getMonth() + 1,
                  dia: { gte: dataInicio.getDate() }
                }
              ]
            }
          ]
        },
        {
          OR: [
            { ano: { lt: dataFim.getFullYear() } },
            {
              ano: dataFim.getFullYear(),
              OR: [
                { mes: { lt: dataFim.getMonth() + 1 } },
                {
                  mes: dataFim.getMonth() + 1,
                  dia: { lte: dataFim.getDate() }
                }
              ]
            }
          ]
        }
      ]
    },
    select: {
      id: true,
      dia: true,
      mes: true,
      ano: true,
      hora: true,
      duracao: true,
      status: true
    },
    orderBy: [
      { ano: 'asc' },
      { mes: 'asc' },
      { dia: 'asc' },
      { hora: 'asc' }
    ]
  });

  return agendamentos.map(a => ({ ...a, duracao: a.duracao ?? 1 }));
};


module.exports = {
  criarAgendamentoService,
  listarAgendamentosService,
  listarTodosAgendamentosService,
  listarAgendamentosPorQuadraService,
  cancelarAgendamentoService,
  listarAgendamentosConfirmadosService,
  atualizarAgendamentoService,
  listarModalidadesPorQuadraService,
  listarAgendamentosPorTimeService
};
