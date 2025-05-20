const express = require('express')
const router = express.Router()
const controller = require('../controllers/usuario.controller.js')
//const validarJWT = require('../middlewares/auth.js')

router.post('/cadastrar/usuario', controller.postUsuario);
//router.post('/cadastrar/usuario', [validarJWT], controller.postUsuario);

module.exports = router;