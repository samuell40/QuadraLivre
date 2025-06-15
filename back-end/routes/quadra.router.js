const express = require('express');
const controller = require('../controllers/quadra.controller');
const router = express.Router();

router.post('/quadra', controller.adicionarQuadra);

router.get('/quadra', controller.getQuadra)

router.post('/times',  controller.criarTime);;

router.get('/times', controller.nomeTime);

router.get('/times/:nome', controller.getTimeNome);

router.put('/placar/:nome', controller.atualizarPlacar);

router.get('/placar', controller.getPlacar);

module.exports = router;
