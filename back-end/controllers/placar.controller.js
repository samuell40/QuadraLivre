const {  criarTimeService, deletarTime, getNomesTimes, buscarTimeNome, atualizarTime, listarPlacar, resetarPlacarPorModalidade, adicionarModalidade } = require('../services/placar.service');

async function criarTime(req, res) {
   const { modalidade, time, foto } = req.body;
  try {
    const novoTime = await criarTimeService({ modalidade, time, foto });
    return res.status(201).json(novoTime);
  } catch (error) {
    console.error('Erro ao criar time:', error);
    return res.status(500).json({ mensagem: 'Erro interno ao criar time.' });
  }
}

async function deletarTimeNome(req, res) {
  const { nome, modalidade } = req.params;
  try {
    const resultado = await deletarTime(nome, modalidade);
    return res.status(200).json(resultado);
  } catch (error) {
    console.error('Erro ao deletar time:', error);
    return res.status(404).json({ error: error.message });
  }
}

async function nomeTime(req, res) {
  const { modalidade } = req.params;
  try {
    const nomes = await getNomesTimes(modalidade);
    return res.status(200).json({ times: nomes });
  } catch (error) {
    console.error('Erro ao buscar nomes dos times:', error);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
}

async function buscarTime(req, res) {
  const { modalidade, nome } = req.params;
  try {
    const time = await buscarTimeNome(modalidade, nome);
    if (!time) {
      return res.status(404).json({ mensagem: 'Time não encontrado.' });
    }
    return res.status(200).json(time);
  } catch (error) {
    console.error('Erro ao buscar time:', error);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
}

async function atualizarPlacar(req, res) {
  const { modalidade, nome, dados } = req.body;
  try {
    const resultado = await atualizarTime(modalidade, nome, dados);
    return res.status(200).json(resultado);
  } catch (error) {
    console.error('Erro ao atualizar time:', error);
    return res.status(500).json({ error: 'Erro ao atualizar time.' });
  }
}

async function getPlacar(req, res) {
  const { modalidade } = req.params;
  try {
    const resultados = await listarPlacar(modalidade);
    return res.status(200).json(resultados);
  } catch (error) {
    console.error('Erro ao buscar placar:', error);
    return res.status(500).json({ message: 'Erro interno ao buscar placar.' });
  }
}

async function resetarPlacar(req, res) {
  console.log('Modalidade recebida:', modalidade);
  try {
    await resetarPlacarPorModalidade(modalidade);
    res.status(200).json({ message: `Placar da modalidade "${modalidade}" resetado com sucesso` });
  } catch (error) {
    console.error('Erro ao resetar placar:', error);
    res.status(500).json({ error: 'Erro ao resetar placar' });
  }
}

async function adicionarModalidadeController(req, res) {
  try {
    const novoPlacar = await adicionarModalidade.adicionarModalidadeController(req.body);
    res.status(201).json(novoPlacar);
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
}

module.exports = { criarTime, deletarTimeNome, nomeTime,  buscarTime,atualizarPlacar, getPlacar, resetarPlacar, adicionarModalidadeController};