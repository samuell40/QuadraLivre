const express = require('express');
const controller = require('../controllers/quadra.controller');
const validarJWT = require('../middlewares/auth')
const verificarPermissao  = require('../services/permissions/permissions.usuario.service.js');
const router = express.Router();

router.post('/quadra', [validarJWT], verificarPermissao.dev, controller.adicionarQuadra);

router.get('/quadra', controller.listarTodasQuadrasController)

router.get('/listar/quadras/:modalidadeId', controller.listarQuadrasPorModalidadeController)

router.patch('/quadra/:id', [validarJWT], verificarPermissao.dev, controller.atualizarQuadraController);

module.exports = router;
