const express = require('express');
const { 
  criarAvisoController, 
  listarAvisosController 
} = require('../controllers/aviso.controller');
const validarJWT = require('../middlewares/auth');

const router = express.Router();

router.post('/avisos', [validarJWT], criarAvisoController);

router.get('/quadras/:quadraId/avisos', [validarJWT], listarAvisosController);

module.exports = router;