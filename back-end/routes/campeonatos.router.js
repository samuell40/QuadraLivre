const express = require('express');
const router = express.Router();
const controller = require('../controllers/campeonatos.controller')

router.post('/criar/campeonato', controller.criarCampeonatoController);

router.delete('/removerCampeonato/:id', controller.removerCampeonatoController);

router.get('/listar/:modalidadeId', controller.listarCampeonatosPorModalidadeController);

module.exports = router;