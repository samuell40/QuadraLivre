const express = require('express')
const controller = require('../controllers/usuario.controller.js')
const permission = require('../services/usuario.service.js')
const validarJWT = require('../middlewares/auth.js');

const router = express.Router()

router.post('/cadastrar/usuario', controller.postUsuario);


router.put('/editar/usuario', validarJWT, [permission.postUsuario], controller.updateUsuario);

module.exports = router;