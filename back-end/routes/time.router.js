const express = require('express');
const controller = require('../controllers/time.controller.js');
const validarJWT = require('../middlewares/auth');
const verificarPermissao  = require('../services/permissions/permissions.usuario.service.js');
const router = express.Router();

router.post( '/modalidade', [validarJWT], verificarPermissao.devAdmin, controller.cadastrarModalidadeController);

router.delete('/modalidade/:id', [validarJWT], verificarPermissao.devAdmin,  controller.removerModalidadeController);

router.get('/listar/modalidade', controller.listarModalidadesController);

router.post('/time', [validarJWT], verificarPermissao.devAdmin, controller.criarTimeController);

router.delete('/remover/time/:id', controller.removerTimeController );

router.get('/times/modalidade/:modalidadeId', controller.listarTimesPorModalidadeController );

router.get('/times', controller.getTodosTimes);

module.exports = router;