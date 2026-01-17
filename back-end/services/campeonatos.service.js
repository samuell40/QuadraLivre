const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function criarCampeonato(data) {
  const {
    nome,
    descricao,
    dataInicio,
    dataFim,
    status,
    modalidadeId,
    quadraId,
    times
  } = data;

  const campeonato = await prisma.campeonato.create({
    data: {
      nome,
      descricao,
      dataInicio: new Date(dataInicio),
      dataFim: new Date(dataFim),
      status,
      modalidadeId: Number(modalidadeId),
      quadraId: Number(quadraId),

      times: {
        create: times.map(timeId => ({
          timeId: Number(timeId)
        }))
      }
    },
    include: {
      modalidade: true,
      quadra: true,
      times: {
        include: {
          time: true
        }
      }
    }
  });

  return campeonato;
}

// async function criarCampeonato(data) {
//   const {
//     nome,
//     descricao,
//     dataInicio,
//     dataFim,
//     status,
//     modalidadeId,
//     quadraId,
//     times,       // Array de IDs: [1, 2, 3]
//     datasJogos,  // NOVO: Array de strings ISO: ["2026-02-01T19:00:00.000Z"]
//     usuarioId    // NOVO: ID do admin criando
//   } = data;

//   // Prepara as datas
//   const listaDatasReais = datasJogos ? datasJogos.map(d => new Date(d)) : [];

//   return await prisma.$transaction(async (tx) => {
    
//     // --- LÓGICA DE PRIORIDADE (DERRUBAR CONFLITOS) ---
//     if (listaDatasReais.length > 0) {
//       const conflitos = await tx.agendamento.findMany({
//         where: {
//           quadraId: Number(quadraId),
//           datahora: { in: listaDatasReais }
//         }
//       });

//       if (conflitos.length > 0) {
//         // Passa o facão nos agendamentos antigos
//         await tx.agendamento.deleteMany({
//           where: { id: { in: conflitos.map(c => c.id) } }
//         });
//       }
//     }

//     // --- PREPARAR OBJETOS DE AGENDAMENTO ---
//     const agendamentosParaCriar = listaDatasReais.map(dataObj => ({
//       datahora: dataObj,
//       dia: dataObj.getUTCDate(),
//       mes: dataObj.getUTCMonth() + 1,
//       ano: dataObj.getUTCFullYear(),
//       hora: dataObj.getUTCHours(),
//       quadraId: Number(quadraId),
//       usuarioId: Number(usuarioId),
//       modalidadeId: Number(modalidadeId),
//       status: "Confirmado",
//       tipo: "EVENTO",
//       duracao: 1
//     }));

//     // --- CRIAÇÃO DO CAMPEONATO E VÍNCULOS ---
//     const campeonato = await tx.campeonato.create({
//       data: {
//         nome,
//         descricao,
//         dataInicio: new Date(dataInicio),
//         dataFim: new Date(dataFim),
//         status,
//         modalidadeId: Number(modalidadeId),
//         quadraId: Number(quadraId),
        
//         // Vincula Times
//         times: {
//           create: times.map(timeId => ({ timeId: Number(timeId) }))
//         },
        
//         // Cria Agendamentos (Horários na Quadra)
//         agendamentos: {
//           create: agendamentosParaCriar
//         },

//         // Cria Placares Zerados (Opcional, mas recomendado)
//         placares: {
//           create: times.map(timeId => ({
//             timeId: Number(timeId),
//             pontuacao: 0,
//             jogos: 0
//           }))
//         }
//       },
//       include: {
//         modalidade: true,
//         quadra: true,
//         times: { include: { time: true } },
//         agendamentos: true // Retorna os horários criados
//       }
//     });

//     return campeonato;
//   });
// }

async function removerCampeonato(campeonatoId) {
  if (!campeonatoId) {
    throw new Error('ID do campeonato é obrigatório.');
  }

  const campeonato = await prisma.campeonato.findUnique({
    where: { id: Number(campeonatoId) }
  });

  if (!campeonato) {
    throw new Error('Campeonato não encontrado.');
  }

  await prisma.partida.deleteMany({ where: { campeonatoId: Number(campeonatoId) } });
  await prisma.placar.deleteMany({ where: { campeonatoId: Number(campeonatoId) } });
  await prisma.campeonatoTime.deleteMany({ where: { campeonatoId: Number(campeonatoId) } });

  await prisma.campeonato.delete({ where: { id: Number(campeonatoId) } });

  return { mensagem: 'Campeonato removido com sucesso.' };
}

async function listarCampeonatosPorModalidade(modalidadeId, ano) {
  try {
    const anoFiltro = ano ? Number(ano) : new Date().getFullYear();

    const campeonatos = await prisma.campeonato.findMany({
      where: {
        modalidadeId: modalidadeId,
        dataInicio: {
          gte: new Date(`${anoFiltro}-01-01`),
          lte: new Date(`${anoFiltro}-12-31`)
        }
      },
      include: {
        modalidade: true,
        quadra: true,
        times: {
          include: {
            time: true
          }
        },
        placares: true
      },
      orderBy: {
        dataInicio: 'desc'
      }
    });

    return campeonatos;
  } catch (error) {
    console.error(error);
    throw new Error('Erro ao listar campeonatos por modalidade.');
  }
}

module.exports = { criarCampeonato, removerCampeonato, listarCampeonatosPorModalidade };