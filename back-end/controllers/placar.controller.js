const { criarTimeService, deletarTime, listarTimesPorModalidade, buscarTimeNome, atualizarTime, listarPlacar, resetarPlacarPorModalidade, cadastrarModalidade, removerModalidade, listarModalidades } = require('../services/placar.service');

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
    await deletarTime(nome, modalidade);
    return res.status(200).json({ mensagem: 'Time deletado com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar time:', error);
    return res.status(404).json({ error: error.message });
  }
}

async function nomeTime(req, res) {
  const { modalidade } = req.params;
  try {
    const nomes = await listarTimesPorModalidade(modalidade);
    return res.status(200).json(nomes); 
  } catch (error) {
    console.error('Erro ao buscar nomes dos times:', error);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
}

async function buscarTime(req, res) {
  const { modalidade, nome } = req.params;
  try {
    const time = await buscarTimeNome(modalidade, nome);
    return res.status(200).json(time);
  } catch (error) {
    console.error('Erro ao buscar time:', error);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
}

async function atualizarPlacar(req, res) {
  const { modalidade, nome } = req.params;
  const dados = req.body;

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
  const { modalidade } = req.body;
  try {
    await resetarPlacarPorModalidade(modalidade);
    res.status(200).json({ message: `Placar da modalidade "${modalidade}" resetado com sucesso` });
  } catch (error) {
    console.error('Erro ao resetar placar:', error);
    res.status(500).json({ error: 'Erro ao resetar placar' });
  }
}

async function cadastrarModalidadeController(req, res) {
  const { nome } = req.body;
  try {
    const novaModalidade = await cadastrarModalidade(nome);
    res.status(201).json(novaModalidade);
  } catch (error) {
    console.error('Erro ao cadastrar modalidade:', error);
    res.status(409).json({ error: 'Modalidade já cadastrada.' });
  }
}

async function removerModalidadeController(req, res) {
  const { nome } = req.params;
  try {
    const resultado = await removerModalidade(nome);
    return res.status(200).json(resultado);
  } catch (error) {
    console.error('Erro ao remover modalidade:', error);
    return res.status(404).json({ error: error.message });
  }
}

async function getModalidadesController(req, res) {
  try {
    const modalidades = await listarModalidades();
    res.status(200).json(modalidades);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar modalidades.' });
  }
}

module.exports = { criarTime, deletarTimeNome, nomeTime,buscarTime, atualizarPlacar, getPlacar, resetarPlacar, cadastrarModalidadeController, removerModalidadeController, getModalidadesController};