const express = require('express')
const controller = require('../controllers/usuario.controller.js')
const validarJWT = require('../middlewares/auth')
const verificarPermissao  = require('../services/permissions/permissions.usuario.service.js');

const router = express.Router()

router.post('/cadastrar/usuario', controller.postUsuarioController);

router.put('/editar/usuario', [validarJWT], verificarPermissao.devAdmin , controller.updateUsuarioController);

router.get('/usuarios',  controller.getUsuariosController);

router.get('/permissoes',[validarJWT], verificarPermissao.devAdmin, controller.getPermissoesController);

router.get('/usuarios/:id/times', [validarJWT], controller.getUsuarioTimesController);

router.post('/vincular', controller.vincularUsuarioTimeController);

module.exports = router;