const express = require('express');
const controller = require('../controllers/partida.controller')
const validarJWT = require('../middlewares/auth');
const router = express.Router();

router.post('/partida', controller.criarPartidaController)

router.put('/partida/:id/encerrar', [validarJWT], controller.finalizarPartidaController);

router.delete('/partidas/:partidaId', controller.excluirPartidaController);

router.put('/partida/:id/parcial', [validarJWT], controller.atualizarParcialController);

router.put('/placar/:id/incrementar', [validarJWT], controller.incrementarPlacarController);

router.get('/partidas/ativas/:modalidadeId/:campeonatoId', controller.listarPartidaAndamentoController);

router.get( '/partidas/pausadas/:modalidadeId/:campeonatoId', controller.listarPartidasPausadasController);

router.get('/partidas/encerradas/:modalidadeId/:campeonatoId', controller.listarPartidasEncerradasController);

router.put("/partidas/:id/pausar", controller.pausarPartidaController);

router.put("/partidas/:id/retomar", controller.retomarPartidaController);

router.get('/partidas/:id/retornar', controller.retornarPartidaEmAndamentoController);

router.post("/:partidaId/jogador/:jogadorId", controller.adicionarJogadorPartidaController);

router.get('/partida/:partidaId', controller.listarJogadoresSelecionadosController);

router.post('/atuacao', controller.atualizarAtuacaoJogadorController);

module.exports = router;