const treinadorService = require('../services/treinador.service');

async function tornarTreinador(req, res) {
  try {
    const { usuarioId, timeId } = req.body;

    if (!usuarioId || !timeId) {
      return res.status(400).json({
        error: 'usuarioId e timeId são obrigatórios',
      });
    }

    const resultado = await treinadorService.tornarUsuarioTreinador(
      Number(usuarioId),
      Number(timeId)
    );

    return res.status(200).json({
      message: 'Usuário definido como treinador com sucesso',
      data: resultado,
    });
  } catch (error) {
    return res.status(400).json({
      error: error.message,
    });
  }
}

module.exports = { tornarTreinador };
