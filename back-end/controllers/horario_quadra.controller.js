const { 
  criarGradeHorariosService, 
  listarGradeService 
} = require("../services/horario_quadra.service");

const criarGradeHorariosController = async (req, res) => {
  try {
    const { quadraId, diaSemana, horarios } = req.body;

    await criarGradeHorariosService(quadraId, diaSemana, horarios);

    return res.status(201).json({ message: "Grade de horários atualizada com sucesso." });
  } catch (err) {
    console.error(err);
    return res
      .status(err.status || 500)
      .json({ error: err.message || "Erro ao definir grade de horários." });
  }
};

const listarGradeController = async (req, res) => {
  try {
    const { quadraId } = req.params;
    const grade = await listarGradeService(quadraId);
    return res.json(grade);
  } catch (err) {
    console.error(err);
    return res
      .status(err.status || 500)
      .json({ error: err.message || "Erro ao listar grade de horários." });
  }
};

module.exports = { 
  criarGradeHorariosController, 
  listarGradeController 
};