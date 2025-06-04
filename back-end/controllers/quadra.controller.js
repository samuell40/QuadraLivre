const { criarQuadra, getQuadras, getNomesTimes, atualizarTime} = require('../services/quadra.service');

async function adicionarQuadra(req, res) {
    try {
        const dadosQuadra = req.body; 
        const novaQuadra = await criarQuadra(dadosQuadra);
        res.status(201).json(novaQuadra);
    } catch (erro) {
        console.error('Erro ao adicionar quadra:', erro);
        res.status(500).json({ erro: 'Erro ao adicionar quadra' });
    }
};

async function getQuadra(req, res) {
    try{
        const quadras = await getQuadras()
        res.status(200).json(quadras)
    } catch(error){
        console.error('Erro ao buscar quadras:', error);
        res.status(500).json({ error: 'Erro ao buscar as qaudras'})
    }
}

async function nomeTime(req, res) {
  try {
    const nomes = await getNomesTimes();
    res.json({ times: nomes });
  } catch (error) {
    console.error('Erro ao pegar nomes dos times:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
}

async function atualizarPlacar(req, res){
  const { nome } = req.params;
  const dados = req.body;

  try {
    const resultado = await atualizarTime(nome, dados);
    res.json(resultado);
  } catch (error) {
    console.error('Erro ao atualizar time:', error);
    res.status(500).json({ error: 'Erro ao atualizar time' });
  }
};

module.exports = { adicionarQuadra, getQuadra, nomeTime, atualizarPlacar};
