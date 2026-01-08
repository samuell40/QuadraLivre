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

const listarAgendamentosConfirmadosSemanaService = async (quadraId) => {
  if (!quadraId) throw { status: 400, message: 'Quadra não informada.' };

  const hoje = new Date();
  const inicioSemana = startOfWeek(hoje, { weekStartsOn: 1 });
  const fimSemana = endOfWeek(hoje, { weekStartsOn: 1 });

  const agendamentos = await prisma.agendamento.findMany({
    where: {
      quadraId,
      status: "Confirmado",
      AND: [
        {
          ano: {
            gte: inicioSemana.getFullYear(),
            lte: fimSemana.getFullYear(),
          },
        },
        {
          mes: {
            gte: inicioSemana.getMonth() + 1,
            lte: fimSemana.getMonth() + 1,
          },
        },
        {
          dia: {
            gte: inicioSemana.getDate(),
            lte: fimSemana.getDate(),
          },
        },
      ],
    },
    include: {
      modalidade: true,
      usuario: { include: { times: { include: { time: true } } } },
    },
    orderBy: [{ hora: 'asc' }],
  });

  return agendamentos.map(a => ({ ...a, duracao: a.duracao ?? 1 }));
};

const criarAgendamentoService = async ({
  usuarioId, dia, mes, ano, hora, duracao = 1, tipo = "TREINO", quadraId, modalidadeId, timeId,
}) => {
  if (!dia || !mes || !ano || !hora || !usuarioId || !quadraId || !modalidadeId) {
    throw { status: 400, message: "Campos obrigatórios não preenchidos." };
  }

  // Valida a existência da quadra e modalidade
  const [quadra, modalidade] = await Promise.all([
    prisma.quadra.findUnique({ where: { id: Number(quadraId) } }),
    prisma.modalidade.findUnique({ where: { id: Number(modalidadeId) } }),
  ]);

  if (!quadra) throw { status: 400, message: "Quadra não existe." };
  if (!modalidade) throw { status: 400, message: "Modalidade não existe." };

  // Se o time foi informado, valida existência e limite semanal
  if (timeId) {
    const time = await prisma.time.findUnique({ where: { id: Number(timeId) } });
    if (!time) throw { status: 400, message: "Time não existe." };

    // Verifica agendamentos do mesmo time na semana 
    const horaNum = Number(hora);
    const duracaoNum = Number(duracao ?? 1);
    const dataAgendamento = new Date(ano, mes - 1, dia);
    dataAgendamento.setHours(horaNum, 0, 0, 0);
    const inicioSemana = startOfWeek(dataAgendamento, { weekStartsOn: 1 });
    const fimSemana = endOfWeek(dataAgendamento, { weekStartsOn: 1 });

    const agendamentosSemana = await prisma.agendamento.findMany({
      where: {
        timeId,
        status: "Confirmado",
        AND: [
          {
            ano: { gte: inicioSemana.getFullYear(), lte: fimSemana.getFullYear() },
          },
          {
            OR: [
              { mes: { gt: inicioSemana.getMonth() + 1 } },
              { mes: inicioSemana.getMonth() + 1, dia: { gte: inicioSemana.getDate() } }
            ]
          },
          {
            OR: [
              { mes: { lt: fimSemana.getMonth() + 1 } },
              { mes: fimSemana.getMonth() + 1, dia: { lte: fimSemana.getDate() } }
            ]
          }
        ]
      },
    });

    const countSemana = agendamentosSemana.filter((a) => {
      const data = new Date(a.ano, a.mes - 1, a.dia);
      return data >= inicioSemana && data <= fimSemana;
    }).length;

    if (countSemana >= 2) {
      throw {
        status: 400,
        message: "Este time já possui 2 agendamentos nesta semana.",
      };
    }
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

  // Cria o agendamento
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
      timeId: timeId ?? null,
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
  listarAgendamentosConfirmadosSemanaService,
  atualizarAgendamentoService,
  listarModalidadesPorQuadraService,
  listarAgendamentosPorTimeService
};
