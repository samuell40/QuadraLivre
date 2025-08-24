const express = require('express');
const { criarAgendamentoController, listarAgendamentosController, cancelarAgendamentoController } = require('../controllers/agendamento.controller');
const validarJWT = require('../middlewares/auth');

const router = express.Router();

// Criar um novo agendamento
router.post('/agendamento', [validarJWT], criarAgendamentoController);

// Listar agendamentos do usuário logado
router.get('/agendamentos', [validarJWT], listarAgendamentosController);

// Cancelar um agendamento
router.delete('/agendamento/:id', validarJWT, cancelarAgendamentoController);

module.exports = router;
