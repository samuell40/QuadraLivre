const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { enviarEmailNovaModalidade } = require('./email.service')

async function cadastrarModalidade(nome) {
  const existente = await prisma.modalidade.findFirst({
    where: { nome }
  });

  if (existente && existente.ativo) {
    throw new Error(`A modalidade "${nome}" já existe.`);
  }

  // existe mas está desativada → reativa
  if (existente && !existente.ativo) {
    return await prisma.modalidade.update({
      where: { id: existente.id },
      data: {
        ativo: true,
        deletedAt: null
      }
    });
  }

  const modalidade = await prisma.modalidade.create({
    data: {
      nome,
      ativo: true
    }
  });

  const placar = await prisma.placar.findFirst({
    where: { time: { modalidadeId: modalidade.id } }
  });

  if (!placar) {
    const ID_DESENVOLVEDOR_SISTEMA = 1;

    const desenvolvedores = await prisma.usuario.findMany({
      where: { permissaoId: ID_DESENVOLVEDOR_SISTEMA },
      select: { nome: true, email: true }
    });

    for (const dev of desenvolvedores) {
      await enviarEmailNovaModalidade(dev, modalidade.nome);
    }
  }

  return modalidade;
}

async function removerModalidade(id) {
  const modalidadeId = Number(id);
  const agora = new Date();

  return await prisma.$transaction(async (tx) => {

    const modalidade = await tx.modalidade.findUnique({
      where: { id: modalidadeId }
    });

    if (!modalidade) return null;

    await tx.modalidade.update({
      where: { id: modalidadeId },
      data: {
        ativo: false,
        deletedAt: agora
      }
    });

    await tx.time.updateMany({
      where: { modalidadeId },
      data: {
        ativo: false,
        deletedAt: agora
      }
    });

    await tx.partida.updateMany({
      where: {
        modalidadeId,
        finalizada: false
      },
      data: {
        cancelada: true,
        ativo: false,
        deletedAt: agora
      }
    });

    await tx.agendamento.updateMany({
      where: {
        modalidadeId,
        status: "Pendente"
      },
      data: {
        status: "Cancelado"
      }
    });

    return { id: modalidadeId, ativo: false };
  });
}

async function listarModalidades() {
  const modalidades = await prisma.modalidade.findMany({
    where: {
      ativo: true,
      deletedAt: null
    },
    include: {
      _count: {
        select: {
          times: {
            where: {
              ativo: true,
              deletedAt: null
            }
          },
          quadras: true
        }
      }
    }
  });

  return modalidades.map(m => ({
    id: m.id,
    nome: m.nome,
    foto: m.foto,
    totalTimes: m._count.times,
    totalQuadras: m._count.quadras
  }));
}

module.exports = { cadastrarModalidade, removerModalidade, listarModalidades };