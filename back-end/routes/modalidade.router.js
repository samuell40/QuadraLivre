const express = require('express');
const controller = require('../controllers/modalidade.controller.js');
const validarJWT = require('../middlewares/auth');
const verificarPermissao  = require('../services/permissions/permissions.usuario.service.js');
const router = express.Router();

router.post( '/modalidade', [validarJWT], verificarPermissao.devAdmin, controller.cadastrarModalidadeController);

router.delete('/modalidade/:id',  controller.removerModalidadeController);

router.get('/listar/modalidade', controller.listarModalidadesController);

module.exports = router;