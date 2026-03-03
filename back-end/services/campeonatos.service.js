const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const {
  enviarEmailVinculoMesarioCampeonato,
  enviarEmailStatusAgendamento
} = require('./email.service');

const FOTO_PADRAO_CAMPEONATO = 'https://pub-8c7959cad5c04469b16f4b0706a2e931.r2.dev/uploads/imagem_campeonatos.png';

const CRITERIOS_MODALIDADE = {
  futebol: [
    { value: "pontuacao", label: "Pontuação" },
    { value: "vitorias", label: "Vitórias" },
    { value: "saldoDeGols", label: "Saldo de gols" },
    { value: "golsPro", label: "Gols pró" },
    { value: "golsSofridos", label: "Gols sofridos" },
    { value: "empates", label: "Empates" },
    { value: "derrotas", label: "Derrotas" },
    { value: "confrontoDireto", label: "Confronto direto" },
    { value: "sorteio", label: "Sorteio" }
  ],
  futsal: [],
  futebolDeAreia: [],
  volei: [
    { value: "pontuacao", label: "Pontuação" },
    { value: "setsVencidos", label: "Sets vencidos" },
    { value: "sorteio", label: "Sorteio" }
  ],
  voleiDeAreia: [],
  futevolei: []
};

CRITERIOS_MODALIDADE.futsal = CRITERIOS_MODALIDADE.futebol;
CRITERIOS_MODALIDADE.futebolDeAreia = CRITERIOS_MODALIDADE.futebol;
CRITERIOS_MODALIDADE.voleiDeAreia = CRITERIOS_MODALIDADE.volei;
CRITERIOS_MODALIDADE.futevolei = CRITERIOS_MODALIDADE.volei;
CRITERIOS_MODALIDADE.beachtenis = CRITERIOS_MODALIDADE.volei;
CRITERIOS_MODALIDADE.beachtennis = CRITERIOS_MODALIDADE.volei;

const CRITERIOS_FUTEBOL = [
  { value: "pontuacao", label: "Pontuacao" },
  { value: "vitorias", label: "Vitorias" },
  { value: "saldoDeGols", label: "Saldo de gols" },
  { value: "golsPro", label: "Gols pro" },
  { value: "golsSofridos", label: "Gols sofridos" },
  { value: "empates", label: "Empates" },
  { value: "derrotas", label: "Derrotas" },
  { value: "confrontoDireto", label: "Confronto direto" },
  { value: "sorteio", label: "Sorteio" }
];

const CRITERIOS_VOLEI_ATUALIZADOS = [
  { value: "pontuacao", label: "Pontuacao" },
  { value: "vitorias", label: "Vitorias" },
  { value: "diferencaSets", label: "Saldo de sets" },
  { value: "diferencaPontos", label: "Saldo de pontos" },
  { value: "setsVencidos", label: "Sets ganhos" },
  { value: "pontosAverage", label: "Pontos average (AV)" },
  { value: "confrontoDireto", label: "Confronto direto" },
  { value: "derrotaWo", label: "W.O. (menos)" },
  { value: "sorteio", label: "Sorteio" }
];

const CRITERIOS_BEACH_TENIS = [
  { value: "pontuacao", label: "Pontuacao" },
  { value: "vitorias", label: "Vitorias" },
  { value: "diferencaSets", label: "Saldo de sets" },
  { value: "diferencaGames", label: "Saldo de games" },
  { value: "setsVencidos", label: "Sets ganhos" },
  { value: "gamesPro", label: "Games ganhos" },
  { value: "confrontoDireto", label: "Confronto direto" },
  { value: "derrotaWo", label: "W.O. (menos)" },
  { value: "sorteio", label: "Sorteio" }
];

CRITERIOS_MODALIDADE.futebol = CRITERIOS_FUTEBOL;
CRITERIOS_MODALIDADE.futsal = CRITERIOS_FUTEBOL;
CRITERIOS_MODALIDADE.futebolDeAreia = CRITERIOS_FUTEBOL;
CRITERIOS_MODALIDADE.volei = CRITERIOS_VOLEI_ATUALIZADOS;
CRITERIOS_MODALIDADE.voleiDeAreia = CRITERIOS_VOLEI_ATUALIZADOS;
CRITERIOS_MODALIDADE.futevolei = CRITERIOS_VOLEI_ATUALIZADOS;
CRITERIOS_MODALIDADE.beachtenis = CRITERIOS_BEACH_TENIS;
CRITERIOS_MODALIDADE.beachtennis = CRITERIOS_BEACH_TENIS;

function normalizarTexto(texto) {
  return String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function paraDataValida(valor) {
  if (!valor) return null;
  const data = valor instanceof Date ? new Date(valor.getTime()) : new Date(valor);
  if (Number.isNaN(data.getTime())) return null;
  data.setSeconds(0, 0);
  return data;
}

function obterChaveDataHora(data) {
  const dataValida = paraDataValida(data);
  if (!dataValida) return '';

  const ano = dataValida.getFullYear();
  const mes = String(dataValida.getMonth() + 1).padStart(2, '0');
  const dia = String(dataValida.getDate()).padStart(2, '0');
  const hora = String(dataValida.getHours()).padStart(2, '0');
  const minuto = String(dataValida.getMinutes()).padStart(2, '0');
  return `${ano}-${mes}-${dia} ${hora}:${minuto}`;
}

function ordenarDatasAsc(lista = []) {
  return [...lista].sort((a, b) => a.getTime() - b.getTime());
}

function duracaoAgendamentoEmMinutos(agendamento) {
  const duracaoHoras = Number(agendamento?.duracao || 1);
  return Number.isFinite(duracaoHoras) && duracaoHoras > 0 ? duracaoHoras * 60 : 60;
}

function intervalosConflitam(inicioA, duracaoA, inicioB, duracaoB) {
  const inicioAData = paraDataValida(inicioA);
  const inicioBData = paraDataValida(inicioB);
  if (!inicioAData || !inicioBData) return false;

  const fimA = new Date(inicioAData.getTime() + duracaoA);
  const fimB = new Date(inicioBData.getTime() + duracaoB);
  return inicioAData < fimB && inicioBData < fimA;
}

function formatarDataHoraCurta(data) {
  const dataValida = paraDataValida(data);
  if (!dataValida) return '';

  try {
    return dataValida.toLocaleString('pt-BR', {
      timeZone: 'America/Fortaleza',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return dataValida.toLocaleString('pt-BR');
  }
}

function montarMotivoRecusaPorPrioridadeCampeonato({ nomeCampeonato, nomeQuadra, datahora }) {
  const dataHoraFormatada = formatarDataHoraCurta(datahora);
  const nomeQuadraSeguro = nomeQuadra || 'a quadra selecionada';
  const nomeCampeonatoSeguro = nomeCampeonato || 'o campeonato';

  return `Seu agendamento foi cancelado porque a quadra ${nomeQuadraSeguro} foi reservada para ${nomeCampeonatoSeguro} em ${dataHoraFormatada}. Campeonatos possuem prioridade sobre reservas comuns.`;
}

function grupoModalidade(nomeModalidade) {
  const nome = normalizarTexto(nomeModalidade);
  if (
    nome.includes('volei') ||
    nome.includes('futevolei') ||
    (nome.includes('beach') && (nome.includes('tenis') || nome.includes('tennis')))
  ) {
    return 'VOLEI';
  }
  return 'FUTEBOL';
}

function isBeachTenisModalidade(nomeModalidade) {
  const nome = normalizarTexto(nomeModalidade);
  return nome.includes('beach') && (nome.includes('tenis') || nome.includes('tennis'));
}

function criteriosClassificacaoPorModalidade(nomeModalidade) {
  if (isBeachTenisModalidade(nomeModalidade)) {
    return CRITERIOS_BEACH_TENIS;
  }

  return grupoModalidade(nomeModalidade) === 'VOLEI'
    ? CRITERIOS_VOLEI_ATUALIZADOS
    : CRITERIOS_FUTEBOL;
}

function normalizarOrdemClassificacao(ordem, nomeModalidade) {
  const padrao = criteriosClassificacaoPorModalidade(nomeModalidade);

  if (!Array.isArray(ordem) || ordem.length === 0) {
    return [...padrao];
  }

  const mapaPadrao = new Map(padrao.map(criterio => [criterio.value, criterio]));
  const ordemNormalizada = [];

  for (const criterio of ordem) {
    const value = String(criterio?.value || '');
    if (!mapaPadrao.has(value) || ordemNormalizada.some(item => item.value === value)) {
      continue;
    }

    const criterioPadrao = mapaPadrao.get(value);
    ordemNormalizada.push({
      value,
      label: String(criterio?.label || criterioPadrao.label || value)
    });
  }

  for (const criterioPadrao of padrao) {
    if (ordemNormalizada.some(item => item.value === criterioPadrao.value)) {
      continue;
    }

    ordemNormalizada.push({ ...criterioPadrao });
  }

  return ordemNormalizada.length ? ordemNormalizada : [...padrao];
}

function regrasPadraoPorModalidade(nomeModalidade) {
  const grupo = grupoModalidade(nomeModalidade);

  if (grupo === 'VOLEI') {
    return {
      grupoRegras: 'VOLEI',
      quantidadeSetsPartida: 5,
      pontosPorSet: 25,
      regraPontosVitoria: 'VITORIA_2_SEMPRE',
      regraPontosDerrota: 'DERROTA_0_SEMPRE',
      pontosEmpate: 0,
      suspensaoAmarelos: null,
      suspensaoVermelhos: null,
      separarCartoesPorFase: false,
      resetarCartoesCadaFase: false
    };
  }

  return {
    grupoRegras: 'FUTEBOL',
    pontosVitoria: 3,
    pontosEmpate: 1,
    pontosDerrota: 0,
    suspensaoAmarelos: null,
    suspensaoVermelhos: null,
    separarCartoesPorFase: false,
    resetarCartoesCadaFase: false
  };
}

const REGRAS_PADRAO_CAMPEONATO = regrasPadraoPorModalidade('futebol');

function normalizarRegrasCampeonato(regras, nomeModalidade) {
  return {
    ...regrasPadraoPorModalidade(nomeModalidade),
    ...(regras || {})
  };
}

async function criarCampeonato(data) {
  const {
    nome,
    tipo,
    dataInicio,
    dataFim,
    status,
    modalidadeId,
    quadraId,
    times,
    datasJogos,
    usuarioId,
    foto,
    regras
  } = data;

  const listaDatasReais = ordenarDatasAsc(
    [...new Map(
      (Array.isArray(datasJogos) ? datasJogos : [])
        .map(paraDataValida)
        .filter(Boolean)
        .map(dataItem => [obterChaveDataHora(dataItem), dataItem])
    ).values()]
  );
  const timesArray = Array.isArray(times) ? times : [];
  const fotoNormalizada = String(foto || '').trim() || FOTO_PADRAO_CAMPEONATO;
  const usuarioIdNum = Number(usuarioId);
  const usuarioAgendamentoId = Number.isFinite(usuarioIdNum) && usuarioIdNum > 0 ? usuarioIdNum : null;
  const dataInicioInformada = dataInicio ? paraDataValida(dataInicio) : null;
  const dataFimInformada = dataFim ? paraDataValida(dataFim) : null;

  if (!nome || !String(nome).trim()) {
    throw new Error('Nome do campeonato e obrigatorio.');
  }

  if (!tipo) {
    throw new Error('Tipo do campeonato e obrigatorio.');
  }

  if (!modalidadeId) {
    throw new Error('Modalidade e obrigatoria.');
  }

  if (!quadraId) {
    throw new Error('Quadra e obrigatoria.');
  }

  if (timesArray.length < 2) {
    throw new Error('Selecione ao menos 2 times para o campeonato.');
  }

  if (!listaDatasReais.length) {
    throw new Error('Selecione ao menos uma data e horario para o campeonato.');
  }

  const dataMinimaAgenda = new Date();
  dataMinimaAgenda.setHours(0, 0, 0, 0);
  dataMinimaAgenda.setDate(dataMinimaAgenda.getDate() + 1);

  if (listaDatasReais.some(dataItem => dataItem < dataMinimaAgenda)) {
    throw new Error('Os horarios do campeonato devem ser cadastrados a partir de amanha.');
  }

  if (dataInicio && !dataInicioInformada) {
    throw new Error('Data inicial do campeonato invalida.');
  }

  if (dataFim && !dataFimInformada) {
    throw new Error('Data final do campeonato invalida.');
  }

  const dataInicioCampeonato = dataInicioInformada || listaDatasReais[0];
  const dataFimCampeonato = dataFimInformada || listaDatasReais[listaDatasReais.length - 1];

  if (dataFimCampeonato < dataInicioCampeonato) {
    throw new Error('A data final do campeonato nao pode ser menor que a data inicial.');
  }

  const agendamentosRecusadosParaNotificar = [];

  const campeonatoCriado = await prisma.$transaction(async (tx) => {
    const modalidadeDB = await tx.modalidade.findUnique({
      where: { id: Number(modalidadeId) }
    });

    if (!modalidadeDB) throw new Error("Modalidade não encontrada no banco.");
    const chaveAuto = modalidadeDB.nome
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, "") 
      .replace(/\s+/g, '') 
      .replace('deareia', 'DeAreia');

    const ordemClassificacao = normalizarOrdemClassificacao(
      CRITERIOS_MODALIDADE[chaveAuto] || [],
      modalidadeDB.nome
    );

    if (listaDatasReais.length > 0) {
      const filtrosDias = [...new Map(
        listaDatasReais.map(dataItem => {
          const chave = `${dataItem.getFullYear()}-${dataItem.getMonth() + 1}-${dataItem.getDate()}`;
          return [chave, {
            ano: dataItem.getFullYear(),
            mes: dataItem.getMonth() + 1,
            dia: dataItem.getDate()
          }];
        })
      ).values()];

      const conflitosCandidatos = await tx.agendamento.findMany({
        where: {
          quadraId: Number(quadraId),
          campeonatoId: null,
          deletedAt: null,
          status: { in: ['Confirmado', 'Pendente'] },
          OR: filtrosDias
        },
        include: {
          usuario: true,
          quadra: true,
          modalidade: true,
          time: true
        }
      });

      const conflitos = conflitosCandidatos.filter((agendamentoExistente) => {
        const inicioAgendamento = paraDataValida(
          agendamentoExistente.datahora || new Date(
            agendamentoExistente.ano,
            agendamentoExistente.mes - 1,
            agendamentoExistente.dia,
            agendamentoExistente.hora,
            0,
            0
          )
        );

        return listaDatasReais.some((dataEvento) =>
          intervalosConflitam(
            inicioAgendamento,
            duracaoAgendamentoEmMinutos(agendamentoExistente),
            dataEvento,
            60
          )
        );
      });

      for (const conflito of conflitos) {
        const dataConflito = paraDataValida(
          conflito.datahora || new Date(conflito.ano, conflito.mes - 1, conflito.dia, conflito.hora, 0, 0)
        );
        const motivoRecusa = montarMotivoRecusaPorPrioridadeCampeonato({
          nomeCampeonato: nome,
          nomeQuadra: conflito.quadra?.nome,
          datahora: dataConflito
        });

        const conflitoAtualizado = await tx.agendamento.update({
          where: { id: conflito.id },
          data: {
            status: 'Recusado',
            motivoRecusa
          },
          include: {
            usuario: true,
            quadra: true,
            modalidade: true,
            time: true
          }
        });

        agendamentosRecusadosParaNotificar.push(conflitoAtualizado);
      }
    }

    const agendamentosParaCriar = listaDatasReais.map(dataObj => ({
      datahora: dataObj,
      dia: dataObj.getDate(),
      mes: dataObj.getMonth() + 1,
      ano: dataObj.getFullYear(),
      hora: dataObj.getHours(),
      quadraId: Number(quadraId),
      usuarioId: usuarioAgendamentoId,
      modalidadeId: modalidadeDB.id,
      status: "Confirmado",
      tipo: "CAMPEONATO",
      duracao: 1
    }));

    const campeonato = await tx.campeonato.create({
      data: {
        nome,
        tipo,
        foto: fotoNormalizada,
        regras: normalizarRegrasCampeonato(regras, modalidadeDB.nome),
        dataInicio: dataInicioCampeonato,
        dataFim: dataFimCampeonato,
        status: status || 'EM_ANDAMENTO',
        modalidadeId: modalidadeDB.id,
        quadraId: Number(quadraId),
        ordemClassificacao, 
        times: {
          create: timesArray.map(timeId => ({ timeId: Number(timeId) }))
        },
        agendamentos: { create: agendamentosParaCriar },
        placares: { create: timesArray.map(timeId => ({ timeId: Number(timeId) })) }
      },
      include: {
        modalidade: true,
        quadra: true,
        times: { include: { time: true } },
        agendamentos: true,
        placares: true
      }
    });

    if (tipo === "PONTOS_CORRIDOS") {
      const fase = await tx.fase.create({ data: { nome: "1° Fase", campeonatoId: campeonato.id } });
      await tx.rodada.create({ data: { nome: "Rodada 1", faseId: fase.id } });
      await tx.placar.updateMany({ where: { campeonatoId: campeonato.id }, data: { faseId: fase.id } });
    }

    if (tipo === "PONTOS_CORRIDOS_ELIMINATORIAS") {
      const fase1 = await tx.fase.create({ data: { nome: "1° Fase", campeonatoId: campeonato.id } });
      await tx.rodada.create({ data: { nome: "Rodada 1", faseId: fase1.id } });
      await tx.placar.updateMany({ where: { campeonatoId: campeonato.id }, data: { faseId: fase1.id } });

      const fase2 = await tx.fase.create({ data: { nome: "Eliminatórias", campeonatoId: campeonato.id } });
      for (const rodadaNome of ["Quartas de Final", "Semifinal", "Final"]) {
        await tx.rodada.create({ data: { nome: rodadaNome, faseId: fase2.id } });
      }
    }

    if (tipo === "ELIMINATORIAS") {
      const fase = await tx.fase.create({ data: { nome: "Eliminatórias", campeonatoId: campeonato.id } });
      for (const rodadaNome of ["Quartas de Final", "Semifinal", "Final"]) {
        await tx.rodada.create({ data: { nome: rodadaNome, faseId: fase.id } });
      }
    }

    return campeonato;
  });

  if (agendamentosRecusadosParaNotificar.length > 0) {
    const envios = agendamentosRecusadosParaNotificar
      .filter(item => item?.usuario?.email)
      .map(item => enviarEmailStatusAgendamento(item));

    const resultados = await Promise.allSettled(envios);
    resultados.forEach((resultado) => {
      if (resultado.status === 'rejected') {
        console.error('Erro ao enviar email de recusa por prioridade de campeonato:', resultado.reason);
      }
    });
  }

  return campeonatoCriado;
}

async function removerCampeonato(campeonatoId) {
  if (!campeonatoId) {
    throw new Error('ID do campeonato é obrigatório.');
  }

  const idNum = Number(campeonatoId);

  const existe = await prisma.campeonato.findUnique({ where: { id: idNum } });
  if (!existe) throw new Error('Campeonato não encontrado.');

  const agora = new Date();

  await prisma.$transaction([
    prisma.partida.updateMany({
      where: { campeonatoId: idNum },
      data: { status: 'DELETADA' }
    }),

    prisma.placar.updateMany({
      where: { campeonatoId: idNum },
      data: { visivel: false, deletedAt: agora }
    }),

    prisma.campeonatoTime.updateMany({
      where: { campeonatoId: idNum },
      data: { ativo: false, deletedAt: agora }
    }),

    prisma.agendamento.updateMany({
      where: { campeonatoId: idNum },
      data: { status: 'Cancelado', deletedAt: agora }
    }),

    prisma.campeonato.update({
      where: { id: idNum },
      data: { ativo: false, deletedAt: agora }
    })
  ]);

  return { mensagem: 'Campeonato e seus registros foram desativados com sucesso.' };
}

async function listarCampeonatosPorModalidade(modalidadeId, ano) {
  try {
    const anoFiltro = ano ? Number(ano) : new Date().getFullYear();

    const campeonatos = await prisma.campeonato.findMany({
      where: {
        modalidadeId: modalidadeId,
        ativo: true,
        deletedAt: null,
        dataInicio: {
          gte: new Date(`${anoFiltro}-01-01`),
          lte: new Date(`${anoFiltro}-12-31`)
        }
      },
      include: {
        modalidade: true,
        quadra: true,
        times: {
          where: { ativo: true, deletedAt: null },
          include: { time: true }
        },
        placares: {
          where: { visivel: true, deletedAt: null },
          include: { time: true },
          orderBy: { posicao: 'asc' }
        },
        agendamentos: {
          where: { deletedAt: null }
        }
      },
      orderBy: { dataInicio: 'desc' }
    });

    // Ajuste: adiciona os critérios de classificação
    return campeonatos.map(c => ({
      ...c,
      ordemClassificacao: normalizarOrdemClassificacao(c.ordemClassificacao, c.modalidade?.nome),
      criteriosClassificacao: normalizarOrdemClassificacao(c.ordemClassificacao, c.modalidade?.nome)
    }));

  } catch (error) {
    console.error(error);
    throw new Error('Erro ao listar campeonatos por modalidade.');
  }
}

async function listarCampeonatosAnoAtual() {
  const anoAtual = new Date().getFullYear();
  const dataInicio = new Date(`${anoAtual}-01-01`);
  const dataFim = new Date(`${anoAtual}-12-31T23:59:59.999`);

  const campeonatos = await prisma.campeonato.findMany({
    where: {
      ativo: true,
      deletedAt: null,
      dataInicio: { gte: dataInicio, lte: dataFim }
    },
    include: {
      modalidade: true,
      quadra: true,
      placares: {
        where: { visivel: true, deletedAt: null },
        include: { time: true },
        orderBy: { posicao: 'asc' }
      }
    },
    orderBy: { dataInicio: 'desc' }
  });

  // Ajuste: inclui os critérios de classificação
  return campeonatos.map(c => ({
    ...c,
    ordemClassificacao: normalizarOrdemClassificacao(c.ordemClassificacao, c.modalidade?.nome),
    criteriosClassificacao: normalizarOrdemClassificacao(c.ordemClassificacao, c.modalidade?.nome)
  }));
}

function extrairMesariosVinculados(regras) {
  if (!regras || typeof regras !== 'object') return [];
  const ids = Array.isArray(regras.mesariosVinculados) ? regras.mesariosVinculados : [];

  return ids
    .map(id => Number(id))
    .filter(id => Number.isInteger(id) && id > 0);
}

async function listarCampeonatosEmAndamentoMesario(usuarioId) {
  const id = Number(usuarioId);

  if (!id) {
    throw new Error('usuarioId invalido');
  }

  const usuario = await prisma.usuario.findUnique({
    where: { id },
    select: { permissaoId: true, ativo: true, deletedAt: true }
  });

  if (!usuario || !usuario.ativo || usuario.deletedAt) {
    throw new Error('Usuario nao encontrado');
  }

  if (Number(usuario.permissaoId) !== 4) {
    return [];
  }

  const campeonatosEmAndamento = await prisma.campeonato.findMany({
    where: {
      ativo: true,
      deletedAt: null,
      status: 'EM_ANDAMENTO'
    },
    include: {
      modalidade: true,
      quadra: true
    },
    orderBy: { dataInicio: 'desc' }
  });

  const campeonatosVinculados = campeonatosEmAndamento.filter(campeonato =>
    extrairMesariosVinculados(campeonato.regras).includes(id)
  );

  return campeonatosVinculados;
}

async function listarMesariosCampeonato(campeonatoId) {
  const id = Number(campeonatoId);
  if (!id) {
    throw new Error('ID do campeonato invalido.');
  }

  const campeonato = await prisma.campeonato.findUnique({
    where: { id },
    select: {
      id: true,
      regras: true
    }
  });

  if (!campeonato) {
    throw new Error('Campeonato nao encontrado.');
  }

  const vinculadosIds = extrairMesariosVinculados(campeonato.regras);

  const mesarios = await prisma.usuario.findMany({
    where: {
      permissaoId: 4,
      ativo: true,
      deletedAt: null
    },
    select: {
      id: true,
      nome: true,
      email: true,
      foto: true
    },
    orderBy: { nome: 'asc' }
  });

  return {
    mesarios,
    vinculadosIds
  };
}

async function atualizarMesariosCampeonato(campeonatoId, mesariosIds = []) {
  const id = Number(campeonatoId);
  if (!id) {
    throw new Error('ID do campeonato invalido.');
  }

  const campeonato = await prisma.campeonato.findUnique({
    where: { id },
    select: {
      id: true,
      nome: true,
      regras: true,
      modalidade: {
        select: { nome: true }
      },
      quadra: {
        select: { nome: true }
      }
    }
  });

  if (!campeonato) {
    throw new Error('Campeonato nao encontrado.');
  }

  const idsVinculadosAntes = extrairMesariosVinculados(campeonato.regras);
  const idsLimpos = [...new Set((Array.isArray(mesariosIds) ? mesariosIds : [])
    .map(valor => Number(valor))
    .filter(valor => Number.isInteger(valor) && valor > 0))];

  let mesariosValidos = [];
  if (idsLimpos.length > 0) {
    mesariosValidos = await prisma.usuario.findMany({
      where: {
        id: { in: idsLimpos },
        permissaoId: 4,
        ativo: true,
        deletedAt: null
      },
      select: {
        id: true,
        nome: true,
        email: true
      }
    });

    if (mesariosValidos.length !== idsLimpos.length) {
      throw new Error('Um ou mais usuarios informados nao sao mesarios validos.');
    }
  }

  const regrasBase = (campeonato.regras && typeof campeonato.regras === 'object')
    ? campeonato.regras
    : {};

  const regrasAtualizadas = {
    ...regrasBase,
    mesariosVinculados: idsLimpos
  };

  await prisma.campeonato.update({
    where: { id },
    data: { regras: regrasAtualizadas }
  });

  const novosVinculosIds = idsLimpos.filter(idMesario => !idsVinculadosAntes.includes(idMesario));
  if (novosVinculosIds.length > 0) {
    const mesariosNovos = mesariosValidos.filter(item => novosVinculosIds.includes(Number(item.id)));
    const envios = mesariosNovos.map(mesario =>
      enviarEmailVinculoMesarioCampeonato(mesario, campeonato)
    );

    const resultadosEnvio = await Promise.allSettled(envios);
    resultadosEnvio.forEach((resultado) => {
      if (resultado.status === 'rejected') {
        console.error('Erro ao enviar email de vinculo de mesario no campeonato:', resultado.reason);
      }
    });
  }

  return listarMesariosCampeonato(id);
}

async function listarArtilhariaCampeonato(campeonatoId, limite = 5) {
  const artilharia = await prisma.jogadorPartida.groupBy({
    by: ['jogadorId'],
    where: {
      partida: {
        campeonatoId: Number(campeonatoId),
        status: 'FINALIZADA'
      }
    },
    _sum: {
      gols: true
    },
    orderBy: {
      _sum: {
        gols: 'desc'
      }
    },
    take: limite
  });

  const jogadoresIds = artilharia.map(a => a.jogadorId);

  const jogadores = await prisma.jogador.findMany({
    where: {
      id: { in: jogadoresIds }
    },
    include: {
      times: {
        include: {
          time: true
        }
      }
    }
  });

  // Retorna dados já com nome, foto, gols e times
  return artilharia.map(item => {
    const jogador = jogadores.find(j => j.id === item.jogadorId);

    return {
      jogadorId: item.jogadorId,
      nome: jogador?.nome,
      foto: jogador?.foto,
      gols: item._sum.gols,
      times: jogador?.times.map(t => t.time.nome) || []
    };
  });
}

async function getCampeonatoById(id) {
  try {
    const campeonato = await prisma.campeonato.findUnique({
      where: { id: Number(id) },
      include: {
        modalidade: true,
        quadra: true,
        times: {
          where: { ativo: true, deletedAt: null },
          include: { time: true }
        },
        partidas: true,
        placares: true,
        agendamentos: {
          where: { deletedAt: null, status: 'Confirmado' },
          orderBy: { datahora: 'asc' }
        }
      }
    });

    if (!campeonato) return null;
    return {
      ...campeonato,
      ordemClassificacao: normalizarOrdemClassificacao(campeonato.ordemClassificacao, campeonato.modalidade?.nome),
      regras: normalizarRegrasCampeonato(campeonato.regras, campeonato.modalidade?.nome)
    };
  } catch (err) {
    throw err;
  }
}

async function getRegrasCampeonato(campeonatoId) {
  const campeonato = await prisma.campeonato.findUnique({
    where: { id: Number(campeonatoId) },
    select: {
      id: true,
      modalidade: { select: { nome: true } },
      regras: true
    }
  });

  if (!campeonato) throw new Error("Campeonato nao encontrado");

  return normalizarRegrasCampeonato(campeonato.regras, campeonato.modalidade?.nome);
}

async function atualizarRegrasCampeonato(campeonatoId, regras) {
  const campeonatoAtual = await prisma.campeonato.findUnique({
    where: { id: Number(campeonatoId) },
    select: {
      id: true,
      modalidade: { select: { nome: true } }
    }
  });

  if (!campeonatoAtual) throw new Error("Campeonato nao encontrado");

  const atualizado = await prisma.campeonato.update({
    where: { id: Number(campeonatoId) },
    data: {
      regras: normalizarRegrasCampeonato(regras, campeonatoAtual.modalidade?.nome)
    },
    select: {
      id: true,
      regras: true
    }
  });

  return normalizarRegrasCampeonato(atualizado.regras, campeonatoAtual.modalidade?.nome);
}

async function atualizarDadosCampeonato(campeonatoId, dados) {
  const id = Number(campeonatoId);
  if (!id) throw new Error('ID de campeonato invalido');

  const existente = await prisma.campeonato.findUnique({
    where: { id },
    select: { id: true }
  });

  if (!existente) throw new Error('Campeonato nao encontrado');

  const payload = {};

  if (typeof dados.nome === 'string' && dados.nome.trim()) {
    payload.nome = dados.nome.trim();
  }

  if (typeof dados.foto === 'string') {
    payload.foto = dados.foto.trim() || null;
  }

  if (dados.quadraId !== undefined) {
    payload.quadraId = dados.quadraId ? Number(dados.quadraId) : null;
  }

  if (dados.dataFim !== undefined) {
    payload.dataFim = dados.dataFim ? new Date(dados.dataFim) : null;
  }

  if (typeof dados.status === 'string' && dados.status.trim()) {
    const statusNormalizado = dados.status.trim().toUpperCase();
    const statusPermitidos = ['EM_ANDAMENTO', 'FINALIZADO', 'CANCELADO'];
    if (!statusPermitidos.includes(statusNormalizado)) {
      throw new Error('Status de campeonato invalido');
    }
    payload.status = statusNormalizado;
  }

  const atualizado = await prisma.campeonato.update({
    where: { id },
    data: payload,
    include: {
      modalidade: true,
      quadra: true,
      times: true,
      partidas: true,
      placares: true
    }
  });

  return {
    ...atualizado,
    regras: normalizarRegrasCampeonato(atualizado.regras, atualizado.modalidade?.nome)
  };
}

async function finalizarCampeonato(campeonatoId) {
  const id = Number(campeonatoId);
  if (!id) throw new Error('ID de campeonato invalido');

  const existente = await prisma.campeonato.findUnique({
    where: { id },
    select: { id: true, status: true, dataFim: true }
  });

  if (!existente) throw new Error('Campeonato nao encontrado');

  const atualizado = await prisma.campeonato.update({
    where: { id },
    data: {
      status: 'FINALIZADO',
      dataFim: existente.dataFim || new Date()
    },
    include: {
      modalidade: true,
      quadra: true,
      times: true,
      partidas: true,
      placares: true
    }
  });

  return {
    ...atualizado,
    regras: normalizarRegrasCampeonato(atualizado.regras, atualizado.modalidade?.nome)
  };
}

async function listarPlacarPorFase(campeonatoId) {
  if (!campeonatoId) throw new Error("campeonatoId é obrigatório");

  // Busca todas as fases do campeonato
  const fases = await prisma.fase.findMany({
    where: { campeonatoId: Number(campeonatoId), ativo: true },
    orderBy: { id: 'asc' },
    include: {
      placares: {
        where: { visivel: true, deletedAt: null },
        include: { time: true },
        orderBy: { posicao: 'asc' }
      }
    }
  });

  // Retorna cada fase com seus placares
  return fases.map(fase => ({
    faseId: fase.id,
    nomeFase: fase.nome,
    placares: fase.placares
  }));
}

async function listarFasesERodadas(campeonatoId) {
  if (!campeonatoId) {
    throw new Error("campeonatoId é obrigatório");
  }

  const fases = await prisma.fase.findMany({
    where: { campeonatoId: Number(campeonatoId), ativo: true },
    orderBy: { id: "asc" },
    include: {
      rodadas: {
        orderBy: { id: "asc" }
      }
    }
  });

  return fases;
}

async function criarFase(campeonatoId, nome, times) {
  try {
    const fase = await prisma.fase.create({
      data: {
        nome,
        campeonatoId,
        ativo: true,
      },
    });

    const placaresData = times.map(timeId => ({
      campeonatoId,
      faseId: fase.id,
      timeId,
    }));

    await prisma.placar.createMany({
      data: placaresData,
      skipDuplicates: true,
    });

    return fase;
  } catch (error) {
    throw new Error(error.message);
  }
}

async function criarRodada(faseId, nomeRodada) {
  const fase = await prisma.fase.findUnique({
    where: { id: faseId },
  });

  if (!fase) {
    throw new Error("Fase não encontrada");
  }

  const rodada = await prisma.rodada.create({
    data: {
      nome: nomeRodada,
      faseId: faseId,
    },
  });

  return rodada;
}

function resultadoTimeNaPartida(partida, timeId) {
  const ehTimeA = Number(partida.timeAId) === Number(timeId);
  const ehTimeB = Number(partida.timeBId) === Number(timeId);
  if (!ehTimeA && !ehTimeB) return null;

  const pontosA = Number(partida.pontosTimeA) || 0;
  const pontosB = Number(partida.pontosTimeB) || 0;
  const woA = Boolean(partida.woTimeA);
  const woB = Boolean(partida.woTimeB);

  if (woA && !woB) return ehTimeA ? 'D' : 'V';
  if (woB && !woA) return ehTimeA ? 'V' : 'D';
  if (pontosA > pontosB) return ehTimeA ? 'V' : 'D';
  if (pontosB > pontosA) return ehTimeA ? 'D' : 'V';
  return 'E';
}

function chaveHistorico(faseId, timeId) {
  return `${Number(faseId)}:${Number(timeId)}`;
}

function adicionarResultadoNoHistorico(historicoMap, faseId, timeId, resultado) {
  if (!faseId || !timeId || !resultado) return;
  if (!['V', 'E', 'D'].includes(resultado)) return;

  const chave = chaveHistorico(faseId, timeId);
  const atual = historicoMap.get(chave) || [];
  if (atual.length >= 3) return;

  atual.push(resultado);
  historicoMap.set(chave, atual);
}

async function listarPlacarPorFaseComUltimosJogos(campeonatoId, faseId = null) {
  const fases = await listarPlacarPorFase(campeonatoId);
  if (!Array.isArray(fases) || !fases.length) return [];

  const faseIdNum = Number(faseId);
  const fasesFiltradas =
    Number.isFinite(faseIdNum) && faseIdNum > 0
      ? fases.filter(fase => Number(fase.faseId) === faseIdNum)
      : fases;

  if (!fasesFiltradas.length) return [];

  const fasesIds = fasesFiltradas.map(fase => Number(fase.faseId));
  const partidasFinalizadas = await prisma.partida.findMany({
    where: {
      campeonatoId: Number(campeonatoId),
      faseId: { in: fasesIds },
      status: 'FINALIZADA'
    },
    select: {
      id: true,
      faseId: true,
      timeAId: true,
      timeBId: true,
      pontosTimeA: true,
      pontosTimeB: true,
      woTimeA: true,
      woTimeB: true,
      data: true
    },
    orderBy: [
      { data: 'desc' },
      { id: 'desc' }
    ]
  });

  const historicoPorTimeEFase = new Map();
  for (const partida of partidasFinalizadas) {
    const resultadoA = resultadoTimeNaPartida(partida, partida.timeAId);
    const resultadoB = resultadoTimeNaPartida(partida, partida.timeBId);

    adicionarResultadoNoHistorico(historicoPorTimeEFase, partida.faseId, partida.timeAId, resultadoA);
    adicionarResultadoNoHistorico(historicoPorTimeEFase, partida.faseId, partida.timeBId, resultadoB);
  }

  return fasesFiltradas.map(fase => ({
    ...fase,
    placares: (fase.placares || []).map(placar => ({
      ...placar,
      ultimosJogos: historicoPorTimeEFase.get(chaveHistorico(fase.faseId, placar.timeId)) || []
    }))
  }));
}

module.exports = {
  CRITERIOS_MODALIDADE,
  REGRAS_PADRAO_CAMPEONATO,
  criarCampeonato,
  removerCampeonato,
  listarCampeonatosPorModalidade,
  listarCampeonatosAnoAtual,
  listarCampeonatosEmAndamentoMesario,
  listarMesariosCampeonato,
  atualizarMesariosCampeonato,
  listarArtilhariaCampeonato,
  getCampeonatoById,
  atualizarDadosCampeonato,
  finalizarCampeonato,
  getRegrasCampeonato,
  atualizarRegrasCampeonato,
  listarPlacarPorFase: listarPlacarPorFaseComUltimosJogos,
  listarFasesERodadas,
  criarFase,
  criarRodada
};
