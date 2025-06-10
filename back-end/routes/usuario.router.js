const express = require('express')
const controller = require('../controllers/usuario.controller.js')
const permission = require('../services/permissions/permissions.usuario.service.js')
const router = express.Router()

router.post('/cadastrar/usuario', [permission.postUsuario], controller.postUsuario);
router.put('/editar/usuario', [permission.postUsuario], controller.updateUsuario);

module.exports = router;