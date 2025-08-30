const express = require('express');
const controller = require('../controllers/partida.controller')
const router = express.Router();

router.post('/partida', controller.criarPartidaController)

router.put('/finalizar/:id', controller.finalizarPartidaController)

router.get('/listar', controller.listarPartidasController)

router.put( '/placar/incrementar/:id', controller.incrementarPlacarController);

module.exports = router;