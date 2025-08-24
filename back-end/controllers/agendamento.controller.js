const { criarAgendamentoService } = require('../services/agendamento.service');

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

module.exports = { criarAgendamentoController };
