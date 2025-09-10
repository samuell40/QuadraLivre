const express = require('express');
const controller = require('../controllers/partida.controller')
const validarJWT = require('../middlewares/auth');
const router = express.Router();

router.post('/partida', [validarJWT], controller.criarPartidaController)

router.put('/partida/:id/encerrar',  [validarJWT], controller.finalizarPartidaController);

router.put('/partida/:id/parcial',  [validarJWT], controller.atualizarParcialController);

router.put('/placar/:id/incrementar', [validarJWT], controller.incrementarPlacarController);

router.get('/partidas', controller.listarPartidasController);

router.get('/partidas/ativas', controller.listarPartidasAtivasController);

router.get('/partidas/encerradas', controller.listarPartidasEncerradasController);

router.put("/partidas/:id/pausar", controller.pausarPartidaController);

router.put("/partidas/:id/retomar", controller.retomarPartidaController);

router.get("/partida/aberta", [validarJWT], controller.listarPartidaAtivasUsuarioController);

router.delete('/limpar/:modalidadeId', controller.limparPartidasPorModalidadeController);

module.exports = router;