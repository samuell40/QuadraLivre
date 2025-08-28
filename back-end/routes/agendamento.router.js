const express = require('express');
const { 
  criarAgendamentoController,
  listarAgendamentosController,
  listarTodosAgendamentosController,
  listarAgendamentosAdminController,
  listarAgendamentosPorQuadraController,
  listarAgendamentosConfirmadosController,
  cancelarAgendamentoController,
  aceitarAgendamentoController,
  recusarAgendamentoController,
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

// Listar agendamentos admin
router.get('/agendamentos/minha-quadra', [validarJWT], listarAgendamentosAdminController);

// Listar agendamentos por quadra
router.get('/agendamentos/quadra/:quadraId', [validarJWT], listarAgendamentosPorQuadraController);

// Listar agendamentos confirmados por quadra
router.get("/agendamentos/quadra/:quadraId/confirmados", listarAgendamentosConfirmadosController);

// Cancelar um agendamento
router.delete('/agendamento/:id', [validarJWT], cancelarAgendamentoController);

// Aceitar um agendamento
router.patch('/agendamento/:id/aceitar', [validarJWT], aceitarAgendamentoController);

// Recusar um agendamento
router.patch('/agendamento/:id/recusar', [validarJWT], recusarAgendamentoController);

// Listar modalidades por quadra (para o modal)
router.get('/quadra/:quadraId/modalidades', [validarJWT], listarModalidadesPorQuadraController);

module.exports = router;
