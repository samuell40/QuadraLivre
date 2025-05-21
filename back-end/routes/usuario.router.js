const express = require('express')
const router = express.Router()
const multer = require('multer');
const controller = require('../controllers/usuario.controller.js')
const storage = multer.memoryStorage();
const upload = multer({ storage });
//const validarJWT = require('../middlewares/auth.js')

router.post('/cadastrar/usuario',upload.single("file"), controller.postUsuario);
//router.post('/cadastrar/usuario', [validarJWT], controller.postUsuario);

module.exports = router;