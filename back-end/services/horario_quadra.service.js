const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const criarGradeHorariosService = async (quadraId, diaSemana, horarios) => {
  if (!quadraId || diaSemana === undefined || !horarios) {
    throw { status: 400, message: "Dados incompletos para definir grade." };
  }

  await prisma.horarioQuadra.deleteMany({
    where: { 
      quadraId: Number(quadraId), 
      diaSemana: Number(diaSemana) 
    },
  });

  if (horarios.length === 0) {
    return true;
  }

  const data = horarios.map((h) => ({
    quadraId: Number(quadraId),
    diaSemana: Number(diaSemana),
    horario: h,
  }));

  await prisma.horarioQuadra.createMany({ data });
  
  return true;
};

const listarGradeService = async (quadraId) => {
  if (!quadraId) throw { status: 400, message: "ID da quadra obrigatório." };

  const grade = await prisma.horarioQuadra.findMany({
    where: { quadraId: Number(quadraId) },
    orderBy: [
      { diaSemana: 'asc' },
      { horario: "asc" }
    ],
  });
  
  return grade;
};

module.exports = { 
  criarGradeHorariosService, 
  listarGradeService 
};