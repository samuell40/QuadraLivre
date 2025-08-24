const express = require('express');
const { criarAgendamentoController } = require('../controllers/agendamento.controller');
const validarJWT = require('../middlewares/auth');

const router = express.Router();

router.post('/agendamento', [validarJWT], criarAgendamentoController);

module.exports = router;
