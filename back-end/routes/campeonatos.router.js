const express = require('express');
const router = express.Router();
const controller = require('../controllers/campeonatos.controller')

router.post('/criar/campeonato', controller.criarCampeonatoController);

router.delete('/removerCampeonato/:id', controller.removerCampeonatoController);

router.get('/listar/:modalidadeId', controller.listarCampeonatosPorModalidadeController);

router.get('/todos/campeonatos', controller.listarCampeonatosAnoAtualController)

router.get('/:campeonatoId/artilharia', controller.artilhariaCampeonatoController );

router.get('/campeonato/:id', controller.listarCampeonatoPorIdController);

router.put('/campeonato/:id', controller.atualizarCampeonatoController);

router.patch('/campeonato/:id/finalizar', controller.finalizarCampeonatoController);

router.get('/campeonato/:id/regras', controller.obterRegrasCampeonatoController);

router.put('/campeonato/:id/regras', controller.atualizarRegrasCampeonatoController);

router.get('/placar/fase/:campeonatoId/', controller.listarPlacarPorFaseController);

router.get('/fases/:campeonatoId/', controller.listarFasesERodadasController);

router.post('/campeonatos/:campeonatoId/fases', controller.adicionarFaseController);

router.post("/rodada/:campeonatoId/:faseId", controller.adicionarRodadaController);

module.exports = router;
