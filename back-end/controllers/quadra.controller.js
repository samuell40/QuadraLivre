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


async function listarTodasQuadrasController(req, res) {
  try {
    const { modalidadeId } = req.query;
    const quadras = await quadraService.listarTodasQuadras(modalidadeId);
    res.status(200).json(quadras);
  } catch (error) {
    console.error('Erro ao buscar quadras:', error);
    res.status(500).json({ error: 'Erro ao buscar as quadras' });
  }
}

async function listarQuadrasPorModalidadeController(req, res) {
  const { modalidadeId } = req.params

  if (!modalidadeId) {
    return res.status(400).json({
      erro: 'Modalidade não informada'
    })
  }

  try {
    const quadras = await quadraService.listarQuadrasPorModalidade(modalidadeId)
    return res.json(quadras)
  } catch (error) {
    return res.status(500).json({
      erro: 'Erro ao buscar quadras por modalidade'
    })
  }
}

async function atualizarQuadraController(req, res) {
  const { id } = req.params;
  const dados = req.body;

  try {
    const quadraAtualizada = await quadraService.atualizarQuadra(id, dados);
    return res.status(200).json(quadraAtualizada);
  } catch (error) {
    console.error('ERRO:', error); 
    
    return res.status(500).json({ 
      error: 'Erro interno ao atualizar quadra',
      detalhe: error.message
    });
  }
}

module.exports = { adicionarQuadra, listarTodasQuadrasController, listarQuadrasPorModalidadeController, atualizarQuadraController };
