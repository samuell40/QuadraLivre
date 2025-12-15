const quadraService = require('../services/quadra.service');

async function adicionarQuadra(req, res) {
  try {
    const dadosQuadra = req.body;
    const novaQuadra = await quadraService.criarQuadra(dadosQuadra);
    res.status(201).json(novaQuadra);
  } catch (erro) {
    console.error('Erro ao adicionar quadra:', erro);
    res.status(500).json({ erro: 'Erro ao adicionar quadra' });
  }
};


async function getQuadra(req, res) {
  try {
    const { modalidadeId } = req.query;

    const quadras = await quadraService.getQuadras(modalidadeId);

    res.status(200).json(quadras);
  } catch (error) {
    console.error('Erro ao buscar quadras:', error);
    res.status(500).json({ error: 'Erro ao buscar as quadras' });
  }
}

module.exports = { adicionarQuadra, getQuadra };
