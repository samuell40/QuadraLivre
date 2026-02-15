const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { enviarEmailStatusAgendamento } = require("./email.service");
const { startOfWeek, endOfWeek, addMinutes } = require("date-fns");

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
  if (!usuarioId) throw { status: 400, message: "Usuário não informado." };

  const agendamentos = await prisma.agendamento.findMany({
    where: { usuarioId },
    include: {
      quadra: true,
      modalidade: true,
      time: true,
      usuario: { include: { times: { include: { time: true } } } },
    },
    orderBy: { datahora: "asc" },
  });
  return agendamentos.map((a) => ({ ...a, duracao: a.duracao ?? 1 }));
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
    orderBy: { datahora: "asc" },
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
    orderBy: { datahora: "asc" },
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
    orderBy: { datahora: "asc" },
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
    orderBy: { datahora: "asc" },
  });

  return agendamentos.map((a) => ({
    ...a,
    duracao: a.duracao ?? 1,
  }));
};

const criarAgendamentoService = async ({
  usuarioId,
  datahora,
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
  fixo = false,
}) => {
  let dataInicio;
  if (datahora) {
    dataInicio = new Date(datahora);
  } else if (ano && mes && dia && hora !== undefined) {
    dataInicio = new Date(ano, mes - 1, dia, hora, 0, 0);
  } else {
    throw {
      status: 400,
      message: "Data/Hora inválida ou campos obrigatórios faltando.",
    };
  }

  if (isNaN(dataInicio.getTime())) {
    throw { status: 400, message: "Data inválida." };
  }

  const diaCalc = dataInicio.getDate();
  const mesCalc = dataInicio.getMonth() + 1;
  const anoCalc = dataInicio.getFullYear();
  const horaCalc = dataInicio.getHours();

  if (!usuarioId || !quadraId || !modalidadeId) {
    throw {
      status: 400,
      message:
        "Campos obrigatórios (usuário, quadra, modalidade) não preenchidos.",
    };
  }

  const agora = new Date();

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

  const diferencaMs = dataInicio.getTime() - agora.getTime();
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

  if (dataInicio < agora) {
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
      const inicioSemana = startOfWeek(dataInicio, { weekStartsOn: 1 });
      const fimSemana = endOfWeek(dataInicio, { weekStartsOn: 1 });

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
          message:
            "Este time já atingiu o limite de 2 horários FIXOS nesta semana. Tente agendar como horário avulso.",
        };
      }
    }
  }

  const agendamentosDoDia = await prisma.agendamento.findMany({
    where: {
      quadraId: Number(quadraId),
      ano: anoCalc,
      mes: mesCalc,
      dia: diaCalc,
      status: { not: "Recusado" },
    },
  });

  const dataFim = addMinutes(dataInicio, duracao * 60);

  const conflito = agendamentosDoDia.find((ag) => {
    const agInicio = ag.datahora
      ? new Date(ag.datahora)
      : new Date(ag.ano, ag.mes - 1, ag.dia, ag.hora, 0, 0);

    const agFim = addMinutes(agInicio, (ag.duracao || 1) * 60);

    return dataInicio < agFim && dataFim > agInicio;
  });

  if (conflito) {
    throw {
      status: 409,
      message: "Horário já agendado ou conflito de horário.",
    };
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
      dia: diaCalc,
      mes: mesCalc,
      ano: anoCalc,
      hora: horaCalc,
      datahora: dataInicio,
      duracao,
      tipo,
      usuarioId,
      quadraId: Number(quadraId),
      modalidadeId: Number(modalidadeId),
      timeId: timeId ? Number(timeId) : null,
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
    orderBy: { datahora: "asc" },
  });

  return agendamentos.map((a) => ({ ...a, duracao: a.duracao ?? 1 }));
};

const recusarAgendamentosVencidos = async () => {
  const agora = new Date();

  const pendentes = await prisma.agendamento.findMany({
    where: { status: "Pendente" },
  });

  const vencidos = pendentes.filter((ag) => {
    const dataDoJogo = ag.datahora
      ? new Date(ag.datahora)
      : new Date(ag.ano, ag.mes - 1, ag.dia, ag.hora);

    return dataDoJogo < agora;
  });

  for (const ag of vencidos) {
    await prisma.agendamento.update({
      where: { id: ag.id },
      data: {
        status: "Recusado",
        motivoRecusa: "Prazo de confirmação expirado (Data passada)",
      },
    });
  }
};

const atualizarAgendamentosFixosService = async (agendamentos, usuarioId) => {
  if (!agendamentos || agendamentos.length === 0) {
    throw { status: 400, message: "Lista de agendamentos vazia." };
  }

  const primeiro = agendamentos[0];
  const timeId = primeiro.timeId;
  const anoRef = primeiro.ano;
  const mesRef = primeiro.mes;
  const diaRef = primeiro.dia;

  if (!timeId) {
    throw {
      status: 400,
      message: "Time não identificado para agendamento fixo.",
    };
  }

  await prisma.agendamento.deleteMany({
    where: {
      timeId: Number(timeId),
      fixo: true,
      status: { in: ["Pendente", "Confirmado"] },
      OR: [
        { ano: { gt: anoRef } },
        { ano: anoRef, mes: { gt: mesRef } },
        { ano: anoRef, mes: mesRef, dia: { gte: diaRef } },
      ],
    },
  });

  const resultados = [];

  for (const ag of agendamentos) {
    try {
      const criado = await criarAgendamentoService({
        usuarioId: usuarioId,
        datahora: ag.datahora,
        dia: ag.dia,
        mes: ag.mes,
        ano: ag.ano,
        hora: ag.hora,
        duracao: ag.duracao,
        tipo: ag.tipo,
        quadraId: ag.quadraId,
        modalidadeId: ag.modalidadeId,
        timeId: ag.timeId,
        fixo: true,
        ignorarRegra: true,
        status: "Confirmado",
      });
      resultados.push(criado);
    } catch (error) {
      if (error.status === 409 || error.status === 400) {
        console.warn(
          `[FIXO] Pulando dia ${ag.dia}/${ag.mes} por conflito ou regra: ${error.message}`,
        );
        continue;
      }

      continue;
    }
  }

  return resultados;
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
  atualizarAgendamentosFixosService,
  listarModalidadesPorQuadraService,
  listarAgendamentosPorTimeService,
  recusarAgendamentosVencidos,
};
