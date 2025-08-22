const express = require('express')
const controller = require('../controllers/usuario.controller.js')
const validarJWT = require('../middlewares/auth')
const verificarPermissao  = require('../services/permissions/permissions.usuario.service.js');

const router = express.Router()

router.post('/cadastrar/usuario', controller.postUsuario);

router.put('/editar/usuario', [validarJWT], verificarPermissao.devAdmin , controller.updateUsuario);

router.get('/usuarios', [validarJWT],  verificarPermissao.devAdmin, controller.getUsuarios);

router.get('/permissoes',[validarJWT], verificarPermissao.devAdmin, controller.getPermissoes);

router.post('/vincular',[validarJWT], verificarPermissao.devAdmin, controller.vincularUsuarioTimeController);

module.exports = router;