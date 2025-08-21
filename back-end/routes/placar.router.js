const express = require('express');
const controller = require('../controllers/placar.controller');
const validarJWT = require('../middlewares/auth');
const router = express.Router();

router.post('/modalidade',[validarJWT], controller.cadastrarModalidadeController);

router.delete('/modalidade/:id',[validarJWT], controller.removerModalidadeController);

router.get('/listar/modalidade', controller.listarModalidadesController);

router.post('/time', [validarJWT],  controller.criarTimeController);

router.delete('/time/:id', [validarJWT], controller.removerTimeController);

router.get('/times/modalidade/:modalidadeId', controller.listarTimesPorModalidadeController);

router.get('/times', controller.getTodosTimes);

router.post('/placar', controller.criarPlacarController);

router.put('/placar/:id', [validarJWT], controller.atualizarPlacarController);

router.get('/placar/modalidade/:modalidadeId', controller.listarPlacarPorModalidadeController);

router.put('/placar/reset/:modalidadeId', [validarJWT], controller.resetarPlacarPorModalidadeController);

router.put('/ocultar', [validarJWT],  controller.ocultarPlacarGeralController);

router.put('/ocultar/:modalidadeId', [validarJWT], controller.ocultarPlacarPorModalidadeController);

router.put('/mostrar',[validarJWT],  controller.mostrarPlacarGeralController);

router.put('/mostrar/:modalidadeId',[validarJWT],  controller.mostrarPlacarPorModalidadeController);

router.get('/visibilidade', controller.listarVisibilidadeController);

module.exports = router;