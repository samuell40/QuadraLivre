const express = require('express');
const controller = require('../controllers/placar.controller');
const validarJWT = require('../middlewares/auth');
const verificarPermissao  = require('../services/permissions/permissions.usuario.service.js');
const router = express.Router();

router.put('/placar/:id', controller.atualizarPlacarController);

router.get('/placar/campeonato/:campeonatoId',controller.listarPlacarPorCampeonatoController);

router.put('/campeonatos/:campeonatoId/classificacao/ordem', controller.salvarOrdemController)

router.get('/ordem/classificacao/:campeonatoId', controller.listarOrdemClassificacaoController);

module.exports = router;