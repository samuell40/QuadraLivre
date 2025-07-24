const express = require('express');
const controller = require('../controllers/quadra.controller');
const validarJWT = require('../middlewares/auth')
const router = express.Router();

router.post('/quadra', [validarJWT], controller.adicionarQuadra);

router.get('/quadra', [validarJWT], controller.getQuadra)

module.exports = router;
