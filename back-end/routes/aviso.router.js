const express = require('express');
const { 
  criarAvisoController,
  listarTodosAvisosController,
  listarAvisosController,
  deletarAvisoController,
  fixarAvisoController,
  lerAvisoController
} = require('../controllers/aviso.controller');
const validarJWT = require('../middlewares/auth');

const router = express.Router();

router.post('/avisos', [validarJWT], criarAvisoController);

router.get('/avisos', [validarJWT], listarTodosAvisosController);

router.get('/quadras/:quadraId/avisos', [validarJWT], listarAvisosController);

router.delete('/avisos/:id', [validarJWT], deletarAvisoController);

router.patch('/avisos/:id/fixar', [validarJWT], fixarAvisoController);

router.post('/avisos/:id/ler', [validarJWT], lerAvisoController);

module.exports = router;