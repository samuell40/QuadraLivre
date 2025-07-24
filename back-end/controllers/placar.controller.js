const placarService = require('../services/placar.service');

async function criarTime(req, res) {
  const { modalidade, time, foto } = req.body;
  try {
    const novoTime = await placarService.criarTimeService({ modalidade, time, foto });
    await placarService.listarTimesPorModalidade(modalidade);
    res.status(201).json(novoTime);
  } catch (error) {
    console.error('Erro ao criar time:', error);
    res.status(500).json({ error: 'Erro interno ao criar time.' });
  }
}

async function deletarTimeNome(req, res) {
  const { nome, modalidade } = req.params;
  try {
    await placarService.deletarTime(nome, modalidade);
    await placarService.listarTimesPorModalidade(modalidade);
    res.status(200).json({ mensagem: 'Time deletado com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar time:', error);
    res.status(404).json({ error: error.message });
  }
}

async function nomeTime(req, res) {
  const { modalidade } = req.params;
  try {
    const nomes = await placarService.listarTimesPorModalidade(modalidade);
    res.status(200).json(nomes);
  } catch (error) {
    console.error('Erro ao buscar nomes dos times:', error);
    res.status(500).json({ error: 'Erro interno ao buscar nomes dos times.' });
  }
}

async function buscarTime(req, res) {
  const { modalidade, nome } = req.params;
  try {
    const time = await placarService.buscarTimeNome(modalidade, nome);
    res.status(200).json(time);
  } catch (error) {
    console.error('Erro ao buscar time:', error);
    res.status(500).json({ error: 'Erro interno ao buscar time.' });
  }
}

async function atualizarPlacar(req, res) {
  const { modalidade, nome } = req.params;
  const dados = req.body;
  try {
    const resultado = await placarService.atualizarTime(modalidade, nome, dados);
    res.status(200).json(resultado);
  } catch (error) {
    console.error('Erro ao atualizar time:', error);
    res.status(500).json({ error: 'Erro interno ao atualizar time.' });
  }
}

async function getPlacar(req, res) {
  const { modalidade } = req.params;
  try {
    const resultados = await placarService.listarPlacar(modalidade);
    res.status(200).json(resultados);
  } catch (error) {
    console.error('Erro ao buscar placar:', error);
    res.status(500).json({ error: 'Erro interno ao buscar placar.' });
  }
}

async function resetarPlacar(req, res) {
  const { modalidade } = req.body;
  try {
    await placarService.resetarPlacarPorModalidade(modalidade);
    res.status(200).json({ mensagem: `Placar da modalidade "${modalidade}" resetado com sucesso.` });
  } catch (error) {
    console.error('Erro ao resetar placar:', error);
    res.status(500).json({ error: 'Erro interno ao resetar placar.' });
  }
}

async function cadastrarModalidadeController(req, res) {
  const { nome } = req.body;
  try {
    const novaModalidade = await placarService.cadastrarModalidade(nome);
    res.status(201).json(novaModalidade);
  } catch (error) {
    console.error('Erro ao cadastrar modalidade:', error);
    res.status(409).json({ error: 'Modalidade já cadastrada.' });
  }
}

async function removerModalidadeController(req, res) {
  const { nome } = req.params;
  try {
    const resultado = await placarService.removerModalidade(nome);
    res.status(200).json(resultado);
  } catch (error) {
    console.error('Erro ao remover modalidade:', error);
    res.status(404).json({ error: error.message });
  }
}

async function getModalidadesController(req, res) {
  try {
    const modalidades = await placarService.listarModalidades();
    res.status(200).json(modalidades);
  } catch (error) {
    console.error('Erro ao buscar modalidades:', error);
    res.status(500).json({ error: 'Erro interno ao buscar modalidades.' });
  }
}

module.exports = { criarTime, deletarTimeNome, nomeTime, buscarTime, atualizarPlacar,  getPlacar, resetarPlacar, cadastrarModalidadeController, removerModalidadeController, getModalidadesController };