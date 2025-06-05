const express = require('express');
const router = express.Router();
const controller = require('../controllers/quadra.controller');

router.post('/quadra', controller.adicionarQuadra);

router.get('/quadra', controller.getQuadra)

router.post('/times',  controller.criarTime);;

router.get('/times', controller.nomeTime);

router.put('/placar/:nome', controller.atualizarPlacar);

router.get('/placar', controller.getPlacar);

module.exports = router;
