const { criarQuadra, getQuadras,criarTimeService,  getNomesTimes, buscarTimeNome, atualizarTime, listarPlacar} = require('../services/quadra.service');

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

async function criarTime(req, res) {
  try {
    const { time , foto} = req.body;
    const novoTime = await criarTimeService({  time, foto });
    res.status(201).json(novoTime);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensagem: 'Erro ao criar time.' });
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

async function getTimeNome(req, res) {
  const nome = req.params.nome;

  try {
    const time = await buscarTimeNome(nome);

    if (!time) {
      return res.status(404).json({ error: 'Time não encontrado' });
    }

    res.json(time);
  } catch (error) {
    console.error('Erro ao buscar time por nome:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
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

async function getPlacar(req, res){
  try {
    const resultados = await listarPlacar();
    res.status(200).json(resultados);
  } catch (error) {
    console.error('Erro ao buscar placar:', error);
    res.status(500).json({ message: 'Erro interno ao buscar placar.' });
  }
};

module.exports = { adicionarQuadra, getQuadra, criarTime, nomeTime,getTimeNome, atualizarPlacar, getPlacar};
