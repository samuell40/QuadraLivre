const express = require('express');
const controller = require('../controllers/time.controller.js');
const validarJWT = require('../middlewares/auth');
const verificarPermissao  = require('../services/permissions/permissions.usuario.service.js');
const router = express.Router();

router.post('/time', [validarJWT], verificarPermissao.devAdmin, controller.criarTimeController);

router.delete('/time/remover/:id', controller.removerTimeController);

router.get('/times/modalidade/:modalidadeId', controller.listarTimesPorModalidadeController );

router.get('/times', controller.getTodosTimes);

router.get('/:campeonatoId/times', controller.listarTimesPorCampeonatoController);

module.exports = router;