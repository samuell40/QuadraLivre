const express = require('express')
const controller = require('../controllers/usuario.controller.js')
const validarJWT = require('../middlewares/auth')
const permission = require('../services/usuario.service.js')

const router = express.Router()

router.post('/cadastrar/usuario', controller.postUsuario);

router.put('/editar/usuario',[validarJWT], controller.updateUsuario);

router.get('/usuarios', [validarJWT], controller.getUsuarios);

router.get('/permissoes',[validarJWT], controller.getPermissoes);

module.exports = router;