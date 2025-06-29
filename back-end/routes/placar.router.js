const express = require('express');
const controller = require('../controllers/placar.controller');
const router = express.Router();

// Times
router.post('/times', controller.criarTime);
router.get('/times/:modalidade', controller.nomeTime);
router.get('/times/:modalidade/:nome', controller.buscarTime);
router.delete('/placar/:modalidade/:nome', controller.deletarTimeNome);

// Placar
router.put('/placar/:modalidade/:nome', controller.atualizarPlacar);
router.get('/placar/:modalidade', controller.getPlacar); 
router.put('/reset', controller.resetarPlacar);  

// Modalidades
router.post('/modalidade', controller.cadastrarModalidadeController);
router.get('/modalidade', controller.getModalidadesController);
router.delete('/modalidade/:nome', controller.removerModalidadeController);

module.exports = router;
