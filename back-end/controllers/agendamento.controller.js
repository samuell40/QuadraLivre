const { 
  criarAgendamentoService, 
  listarAgendamentosService, 
  listarTodosAgendamentosService, 
  listarAgendamentosPorQuadraService, 
  cancelarAgendamentoService, 
  listarModalidadesPorQuadraService } = require('../services/agendamento.service');

const criarAgendamentoController = async (req, res) => {
  try {
    const usuarioId = req.user?.id || req.body.usuarioId;
    const { dia, mes, ano, hora, duracao, tipo, quadraId } = req.body;

    const agendamento = await criarAgendamentoService({ usuarioId, dia, mes, ano, hora, duracao, tipo, quadraId });
    return res.status(201).json(agendamento);
  } catch (err) {
    console.error(err);
    return res.status(err.status || 500).json({ error: err.message || 'Erro ao criar agendamento.' });
  }
};

const listarAgendamentosController = async (req, res) => {
  try {
    const usuarioId = req.user?.id; 

    const agendamentos = await listarAgendamentosService(usuarioId);
    return res.status(200).json(agendamentos);
  } catch (err) {
    console.error(err);
    return res.status(err.status || 500).json({ error: err.message || 'Erro ao listar agendamentos.' });
  }
};

const listarTodosAgendamentosController = async (req, res) => {
  try {
    const agendamentos = await listarTodosAgendamentosService();
    return res.status(200).json(agendamentos);
  } catch (err) {
    console.error(err);
    return res.status(err.status || 500).json({ error: err.message || 'Erro ao listar todos os agendamentos.' });
  }
};

const listarAgendamentosPorQuadraController = async (req, res) => {
  try {
    const { perfil } = req.user;
    const { quadraId } = req.params;

    if (perfil !== 'admin') {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    if (!quadraId) {
      return res.status(400).json({ message: 'Quadra não informada' });
    }

    const agendamentos = await listarAgendamentosPorQuadraService(quadraId);
    return res.status(200).json(agendamentos);
  } catch (err) {
    console.error(err);
    return res.status(err.status || 500).json({ error: err.message || 'Erro ao listar agendamentos da quadra.' });
  }
};

const cancelarAgendamentoController = async (req, res) => {
  try {
    const { id } = req.params;
    await cancelarAgendamentoService(id);
    return res.status(200).json({ message: 'Agendamento deletado com sucesso.' });
  } catch (err) {
    console.error(err);
    return res.status(err.status || 500).json({ error: err.message || 'Erro ao deletar agendamento.' });
  }
};

const listarModalidadesPorQuadraController = async (req, res) => {
  try {
    const { quadraId } = req.params;
    const modalidades = await listarModalidadesPorQuadraService(quadraId);
    return res.status(200).json(modalidades);
  } catch (err) {
    console.error(err);
    return res.status(err.status || 500).json({ error: err.message || 'Erro ao listar modalidades.' });
  }
};

module.exports = { 
  criarAgendamentoController, 
  listarAgendamentosController, 
  listarTodosAgendamentosController,
  listarAgendamentosPorQuadraController,
  cancelarAgendamentoController ,
  listarModalidadesPorQuadraController
};
