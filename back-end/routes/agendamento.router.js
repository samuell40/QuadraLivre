const express = require('express');
const { 
  criarAgendamentoController,
  listarAgendamentosController,
  listarTodosAgendamentosController,
  listarAgendamentosPorQuadraController,
  cancelarAgendamentoController
} = require('../controllers/agendamento.controller');
const validarJWT = require('../middlewares/auth');

const router = express.Router();

// Criar um novo agendamento
router.post('/agendamento', [validarJWT], criarAgendamentoController);

// Listar agendamentos do usuário logado
router.get('/agendamentos', [validarJWT], listarAgendamentosController);

// Listar todos os agendamentos (admin)
router.get('/agendamentos/todos', [validarJWT], listarTodosAgendamentosController);

// Listar agendamentos por quadra
router.get('/agendamentos/quadra/:quadraId', listarAgendamentosPorQuadraController);

// Cancelar um agendamento
router.delete('/agendamento/:id', validarJWT, cancelarAgendamentoController);

module.exports = router;
