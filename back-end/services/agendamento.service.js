const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { enviarEmailStatusAgendamento } = require("./email.service");
const { startOfWeek, endOfWeek } = require("date-fns");

const gerarCodigoVerificacao = () => {
  const caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let codigo = "";
  for (let i = 0; i < 6; i++) {
    codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  return codigo;
};

const listarAgendamentosService = async (usuarioId) => {
  await recusarAgendamentosVencidos();

  if (!usuarioId) {
    throw { status: 400, message: "Usuário não informado." };
  }

  const agendamentos = await prisma.agendamento.findMany({
    where: { usuarioId },
    include: {
      quadra: true,
      modalidade: true,
      time: true,
      usuario: {
        include: {
          times: {
            include: { time: true },
          },
        },
      },
    },
    orderBy: [{ ano: "asc" }, { mes: "asc" }, { dia: "asc" }, { hora: "asc" }],
  });

  return agendamentos.map((a) => ({
    ...a,
    duracao: a.duracao ?? 1,
  }));
};

const listarTodosAgendamentosService = async () => {
  await recusarAgendamentosVencidos();

  const agendamentos = await prisma.agendamento.findMany({
    include: {
      quadra: true,
      modalidade: true,
      time: true,
      usuario: {
        include: {
          times: {
            include: { time: true },
          },
        },
      },
    },
    orderBy: [{ ano: "asc" }, { mes: "asc" }, { dia: "asc" }, { hora: "asc" }],
  });

  return agendamentos.map((a) => ({
    ...a,
    duracao: a.duracao ?? 1,
  }));
};

const listarAgendamentosPorQuadraService = async (quadraId) => {
  await recusarAgendamentosVencidos();

  if (!quadraId) {
    throw { status: 400, message: "Quadra não informada." };
  }

  const agendamentos = await prisma.agendamento.findMany({
    where: { quadraId: Number(quadraId) },
    include: {
      quadra: true,
      modalidade: true,
      time: true,
      usuario: {
        include: {
          times: {
            include: { time: true },
          },
        },
      },
    },
    orderBy: [{ ano: "asc" }, { mes: "asc" }, { dia: "asc" }, { hora: "asc" }],
  });

  return agendamentos.map((a) => ({
    ...a,
    duracao: a.duracao ?? 1,
  }));
};

const listarAgendamentosConfirmadosService = async (
  quadraId,
  ano,
  mes,
  dia,
) => {
  await recusarAgendamentosVencidos();
  
  if (!quadraId) {
    throw { status: 400, message: "Quadra não informada." };
  }

  const agendamentos = await prisma.agendamento.findMany({
    where: {
      quadraId,
      status: "Confirmado",
      ano,
      mes,
      dia,
    },
    include: {
      modalidade: true,
      time: true,
      usuario: {
        include: {
          times: {
            include: { time: true },
          },
        },
      },
    },
    orderBy: [{ hora: "asc" }],
  });

  return agendamentos.map((a) => ({
    ...a,
    duracao: a.duracao ?? 1,
  }));
};

const listarAgendamentosConfirmadosSemanaService = async (quadraId) => {
  await recusarAgendamentosVencidos();

  if (!quadraId) throw { status: 400, message: "Quadra não informada." };

  const hoje = new Date();
  const inicioSemana = startOfWeek(hoje, { weekStartsOn: 1 });
  const fimSemana = endOfWeek(hoje, { weekStartsOn: 1 });

  const agendamentos = await prisma.agendamento.findMany({
    where: {
      quadraId: Number(quadraId),
      status: "Confirmado",
      AND: [
        {
          OR: [
            { ano: { gt: inicioSemana.getFullYear() } },
            {
              ano: inicioSemana.getFullYear(),
              OR: [
                { mes: { gt: inicioSemana.getMonth() + 1 } },
                {
                  mes: inicioSemana.getMonth() + 1,
                  dia: { gte: inicioSemana.getDate() },
                },
              ],
            },
          ],
        },
        {
          OR: [
            { ano: { lt: fimSemana.getFullYear() } },
            {
              ano: fimSemana.getFullYear(),
              OR: [
                { mes: { lt: fimSemana.getMonth() + 1 } },
                {
                  mes: fimSemana.getMonth() + 1,
                  dia: { lte: fimSemana.getDate() },
                },
              ],
            },
          ],
        },
      ],
    },
    include: {
      modalidade: true,
      time: true,
      usuario: {
        include: {
          times: { include: { time: true } },
        },
      },
    },
  });

  return agendamentos.map((a) => ({
    ...a,
    duracao: a.duracao ?? 1,
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
  ignorarRegra = false,
  status = "Pendente",
  fixo = false
}) => {
  if (
    !dia ||
    !mes ||
    !ano ||
    !hora ||
    !usuarioId ||
    !quadraId ||
    !modalidadeId
  ) {
    throw { status: 400, message: "Campos obrigatórios não preenchidos." };
  }

  const agora = new Date();
  const dataAgendamento = new Date(ano, mes - 1, dia, hora, 0, 0);

  const regrasAntecedencia = {
    TREINO: 24,
    AMISTOSO: 168,
    CAMPEONATO: 720,
    EVENTO: 4320,
    OUTRO: 24,
  };

  const tipoUpper = tipo.toUpperCase();
  const antecedenciaMinimaSugerida =
    regrasAntecedencia[tipoUpper] || regrasAntecedencia.OUTRO;

  const diferencaMs = dataAgendamento.getTime() - agora.getTime();
  const diferencaHoras = diferencaMs / (1000 * 60 * 60);

  if (!ignorarRegra && diferencaHoras < antecedenciaMinimaSugerida) {
    const tempoTexto =
      antecedenciaMinimaSugerida >= 24
        ? `${antecedenciaMinimaSugerida / 24} dias`
        : `${antecedenciaMinimaSugerida} horas`;

    throw {
      status: 400,
      message: `Antecedência mínima não respeitada. Para ${tipoUpper}, o agendamento deve ser feito com pelo menos ${tempoTexto} de antecedência.`,
    };
  }

  if (dataAgendamento < agora) {
    throw {
      status: 400,
      message: "Não é possível realizar agendamentos no passado.",
    };
  }

  const [quadra, modalidade] = await Promise.all([
    prisma.quadra.findUnique({ where: { id: Number(quadraId) } }),
    prisma.modalidade.findUnique({ where: { id: Number(modalidadeId) } }),
  ]);

  if (!quadra) throw { status: 400, message: "Quadra não existe." };
  if (quadra.interditada) {
    throw {
      status: 400,
      message:
        "Essa quadra está interditada no momento. Não é possível agendar.",
    };
  }
  if (!modalidade) throw { status: 400, message: "Modalidade não existe." };

  if (timeId) {
    const time = await prisma.time.findUnique({
      where: { id: Number(timeId) },
    });
    if (!time) throw { status: 400, message: "Time não existe." };

    if (fixo && !ignorarRegra) {
      const inicioSemana = startOfWeek(dataAgendamento, { weekStartsOn: 1 });
      const fimSemana = endOfWeek(dataAgendamento, { weekStartsOn: 1 });

      const qtdFixosNaSemana = await prisma.agendamento.count({
        where: {
          timeId: Number(timeId),
          fixo: true,
          status: { in: ["Confirmado", "Pendente"] },
          AND: [
            {
              ano: {
                gte: inicioSemana.getFullYear(),
                lte: fimSemana.getFullYear(),
              },
            },
            {
              OR: [
                { mes: { gt: inicioSemana.getMonth() + 1 } },
                {
                  mes: inicioSemana.getMonth() + 1,
                  dia: { gte: inicioSemana.getDate() },
                },
              ],
            },
            {
              OR: [
                { mes: { lt: fimSemana.getMonth() + 1 } },
                {
                  mes: fimSemana.getMonth() + 1,
                  dia: { lte: fimSemana.getDate() },
                },
              ],
            },
          ],
        },
      });

      if (qtdFixosNaSemana >= 2) {
        throw {
          status: 400,
          message: "Este time já atingiu o limite de 2 horários FIXOS nesta semana. Tente agendar como horário avulso.",
        };
      }
    }
  }

  const conflito = await prisma.agendamento.findFirst({
    where: {
      dia,
      mes,
      ano,
      quadraId,
      hora: { gte: hora, lt: hora + duracao },
      status: { not: "Recusado" },
    },
  });

  if (conflito) {
    throw { status: 409, message: "Horário já agendado." };
  }

  let novoCodigo = gerarCodigoVerificacao();
  let codigoExiste = await prisma.agendamento.findUnique({
    where: { codigoVerificacao: novoCodigo },
  });
  while (codigoExiste) {
    novoCodigo = gerarCodigoVerificacao();
    codigoExiste = await prisma.agendamento.findUnique({
      where: { codigoVerificacao: novoCodigo },
    });
  }

  const agendamento = await prisma.agendamento.create({
    data: {
      dia,
      mes,
      ano,
      hora,
      duracao,
      tipo,
      usuarioId,
      quadraId,
      modalidadeId,
      timeId: timeId ?? null,
      codigoVerificacao: novoCodigo,
      status,
      fixo,
    },
    include: {
      modalidade: true,
      usuario: { include: { times: { include: { time: true } } } },
      time: true,
    },
  });

  return { ...agendamento, duracao: agendamento.duracao ?? 1 };
};

const cancelarAgendamentoService = async (id) => {
  if (!id) throw { status: 400, message: "ID do agendamento obrigatório." };

  const agendamento = await prisma.agendamento.findUnique({
    where: { id: Number(id) },
  });
  if (!agendamento)
    throw { status: 404, message: "Agendamento não encontrado." };

  await prisma.agendamento.delete({ where: { id: Number(id) } });
  return true;
};

const atualizarAgendamentoService = async (id, status, motivoRecusa = null) => {
  if (!id || !status)
    throw { status: 400, message: "ID e status são obrigatórios." };

  const agendamento = await prisma.agendamento.findUnique({
    where: { id: Number(id) },
  });

  if (!agendamento)
    throw { status: 404, message: "Agendamento não encontrado." };

  const justificativa =
    status === "Recusado" && !motivoRecusa
      ? "O administrador da quadra não informou um motivo específico."
      : motivoRecusa;

  const atualizado = await prisma.agendamento.update({
    where: { id: Number(id) },
    data: {
      status,
      motivoRecusa: status === "Recusado" ? justificativa : null,
    },
    include: { usuario: true, quadra: true, modalidade: true, time: true },
  });

  try {
    await enviarEmailStatusAgendamento(atualizado);
  } catch (err) {
    console.error("Erro ao enviar email:", err);
  }

  return atualizado;
};

const listarModalidadesPorQuadraService = async (quadraId) => {
  await recusarAgendamentosVencidos();

  if (!quadraId) throw { status: 400, message: "Quadra não informada." };

  try {
    const quadra = await prisma.quadra.findUnique({
      where: { id: Number(quadraId) },
      include: { modalidades: true },
    });

    if (!quadra) throw { status: 404, message: "Quadra não encontrada." };

    return quadra.modalidades;
  } catch (err) {
    console.error("Erro no service de modalidades:", err);
    throw { status: 500, message: "Erro ao buscar modalidades da quadra." };
  }
};

const listarAgendamentosPorTimeService = async (timeId, inicio, fim) => {
  await recusarAgendamentosVencidos();

  if (!timeId || !inicio || !fim) {
    throw { status: 400, message: "Parâmetros obrigatórios não informados." };
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
                  dia: { gte: dataInicio.getDate() },
                },
              ],
            },
          ],
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
                  dia: { lte: dataFim.getDate() },
                },
              ],
            },
          ],
        },
      ],
    },
    select: {
      id: true,
      dia: true,
      mes: true,
      ano: true,
      hora: true,
      duracao: true,
      status: true,
    },
    orderBy: [{ ano: "asc" }, { mes: "asc" }, { dia: "asc" }, { hora: "asc" }],
  });

  return agendamentos.map((a) => ({ ...a, duracao: a.duracao ?? 1 }));
};

const recusarAgendamentosVencidos = async () => {
  const agora = new Date();
  
  const pendentes = await prisma.agendamento.findMany({
    where: { status: 'Pendente' }
  });

  const vencidos = pendentes.filter(ag => {
    const dataDoJogo = new Date(ag.ano, ag.mes - 1, ag.dia, ag.hora);
    
    return dataDoJogo < agora;
  });

  for (const ag of vencidos) {
    await prisma.agendamento.update({
      where: { id: ag.id },
      data: { 
        status: 'Recusado',
        motivoRecusa: 'Prazo de confirmação expirado (Data passada)'
      }
    });
  }
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
  listarAgendamentosPorTimeService,
  recusarAgendamentosVencidos
};
