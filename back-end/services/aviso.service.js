const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const emailService = require('./email.service');

async function criarAviso(dados) {
  let idQuadraTratado = null;
  
  if (dados.quadraId && dados.quadraId !== "null" && dados.quadraId !== "" && Number(dados.quadraId) !== 0) {
      idQuadraTratado = Number(dados.quadraId);
  }

  const idAutorTratado = Number(dados.autorId);

  const novoAviso = await prisma.aviso.create({
    data: {
      titulo: dados.titulo,
      descricao: dados.descricao,
      foto: dados.foto,
      fixado: dados.fixado || false,
      quadraId: idQuadraTratado,
      autorId: idAutorTratado
    },
    include: { quadra: true }
  });

  try {
    const usuarios = await prisma.usuario.findMany({
        where: { NOT: { id: idAutorTratado } },
        select: { email: true }
    });
    const listaEmails = usuarios.map(u => u.email);
    emailService.enviarEmailNovoAviso(listaEmails, novoAviso).catch(err => console.error("Erro email:", err));
  } catch (error) {
    console.error("Erro ao buscar emails:", error);
  }

  return novoAviso;
}

async function listarAvisosPorQuadra(quadraId) {
  let whereClause = {};

  if (quadraId === null || quadraId === 'geral' || quadraId === 'null') {
    whereClause = { quadraId: null };
  } else {
    const idNumero = Number(quadraId);
    if (idNumero === 0 || isNaN(idNumero)) {
        whereClause = { quadraId: null }; 
    } else {
        whereClause = { quadraId: idNumero };
    }
  }

  const avisos = await prisma.aviso.findMany({
    where: whereClause,
    include: {
      autor: true,
      quadra: true,
      leituras: true
    },
    orderBy: [
      { fixado: 'desc' },
      { data: 'desc' }
    ]
  });

  return avisos;
}

async function deletarAviso(id) {
  return await prisma.aviso.delete({
    where: { id: Number(id) }
  });
}

async function alternarFixado(id, statusFixado) {
  return await prisma.aviso.update({
    where: { id: Number(id) },
    data: { fixado: statusFixado }
  });
}

async function marcarComoLido(avisoId, usuarioId) {
  const jaLeu = await prisma.avisoLeitura.findUnique({
    where: {
      usuarioId_avisoId: {
        usuarioId: Number(usuarioId),
        avisoId: Number(avisoId)
      }
    }
  });

  if (jaLeu) return jaLeu;

  return await prisma.avisoLeitura.create({
    data: {
      avisoId: Number(avisoId),
      usuarioId: Number(usuarioId)
    }
  });
}

module.exports = { 
  criarAviso, 
  listarAvisosPorQuadra, 
  deletarAviso, 
  alternarFixado, 
  marcarComoLido 
};