const express = require('express')
const controller = require('../controllers/usuario.controller.js')
const validarJWT = require('../middlewares/auth')
const verificarPermissao  = require('../services/permissions/permissions.usuario.service.js');

const router = express.Router()

router.post('/cadastrar/usuario', controller.cadastrarUsuarioController);

router.put('/editar/usuario', [validarJWT], verificarPermissao.devAdmin , controller.atualizarUsuarioController);

router.get('/usuarios',  controller.listarUsuariosController);

router.get('/permissoes',[validarJWT], verificarPermissao.devAdmin, controller.listarPermissoesController);

router.get('/usuarios/:id/times', [validarJWT], controller.listarUsuarioTimesController);

router.post('/vincular', controller.vincularUsuarioTimeController);

module.exports = router;