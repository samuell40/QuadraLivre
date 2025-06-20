const express = require('express');
const controller = require('../controllers/placar.controller');
const router = express.Router();

router.post('/times', controller.criarTime);

router.delete('/placar/:modalidade/:nome', controller.deletarTimeNome);

router.get('/times/:modalidade', controller.nomeTime);

router.get('/times/:modalidade/:nome', controller.buscarTime); 

router.put('/placar/:nome', controller.atualizarPlacar);

router.get('/placar/:modalidade', controller.getPlacar);

router.post('/placar', controller.adicionarModalidadeController);

router.put('/reset', controller.resetarPlacar);

module.exports = router;
