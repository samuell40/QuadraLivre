const express = require('express');
const { 
  criarAgendamentoController,
  listarAgendamentosController,
  listarTodosAgendamentosController,
  listarAgendamentosPorQuadraController,
  cancelarAgendamentoController,
  listarModalidadesPorQuadraController
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
router.get('/agendamentos/quadra/:quadraId', [validarJWT], listarAgendamentosPorQuadraController);

// Cancelar um agendamento
router.delete('/agendamento/:id', [validarJWT], cancelarAgendamentoController);

// Mostrar modalidades por quadra (para o modal)
router.get('/quadra/:quadraId/modalidades', [validarJWT], listarModalidadesPorQuadraController);

module.exports = router;
