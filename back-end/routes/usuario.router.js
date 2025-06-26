const express = require('express')
const controller = require('../controllers/usuario.controller.js')
const permission = require('../services/usuario.service.js')
const validarJWT = require('../middlewares/auth.js');

const router = express.Router()

router.post('/cadastrar/usuario', controller.postUsuario);

router.put('/editar/usuario', controller.updateUsuario);

router.get('/usuarios', controller.getUsuarios);

router.get('/permissoes', controller.getPermissoes);

module.exports = router;