const express = require('express');
const controller = require('../controllers/placar.controller');
const validarJWT = require('../middlewares/auth');
const verificarPermissao  = require('../services/permissions/permissions.usuario.service.js');
const router = express.Router();

router.post('/placar', controller.criarPlacarController );

router.put('/placar/:id', controller.atualizarPlacarController);

router.get('/placar/campeonato/:campeonatoId',controller.listarPlacarPorCampeonatoController);

module.exports = router;