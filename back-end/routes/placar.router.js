const express = require('express');
const controller = require('../controllers/placar.controller');
const validarJWT = require('../middlewares/auth')
const router = express.Router();

// Times
router.post('/times', [validarJWT], controller.criarTime);
router.get('/times/:modalidade', [validarJWT], controller.nomeTime);
router.get('/times/:modalidade/:nome', [validarJWT], controller.buscarTime);
router.delete('/placar/:modalidade/:nome', [validarJWT], controller.deletarTimeNome);

// Placar
router.put('/placar/:modalidade/:nome', [validarJWT], controller.atualizarPlacar);
router.get('/placar/:modalidade', controller.getPlacar); 
router.put('/reset', [validarJWT], controller.resetarPlacar);  

// Modalidades
router.post('/modalidade', [validarJWT],  controller.cadastrarModalidadeController);
router.get('/modalidade', [validarJWT], controller.getModalidadesController);
router.delete('/modalidade/:nome',[validarJWT],  controller.removerModalidadeController);

module.exports = router;
