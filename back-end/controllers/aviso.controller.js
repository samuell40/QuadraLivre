const avisoService = require('../services/aviso.service');

async function criarAvisoController(req, res) {
  try {
    const novoAviso = await avisoService.criarAviso(req.body);
    
    return res.status(201).json(novoAviso);
  } catch (error) {
    console.error("Erro ao criar aviso:", error);
    return res.status(500).json({ error: 'Erro ao criar aviso, tente mais tarde.' });
  }
}

async function listarAvisosController(req, res) {
  try {
    const { quadraId } = req.params;
    
    const lista = await avisoService.listarAvisosPorQuadra(quadraId);
    
    return res.status(200).json(lista);
  } catch (error) {
    console.error("Erro ao buscar avisos:", error);
    return res.status(500).json({ error: 'Erro ao buscar avisos.' });
  }
}

module.exports = {
  criarAvisoController,
  listarAvisosController
};