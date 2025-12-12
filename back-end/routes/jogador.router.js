const express = require('express');
const router = express.Router();
const controller = require('../controllers/jogadores.controller');

router.post('/adicionar', controller.adicionarJogadorController);

router.delete('/remover/:timeId/:jogadorId', controller.removerJogadorController);

router.get('/time/:timeId', controller.listarJogadoresController);

router.post('/adicionar/funcao', controller.adicionarFuncaoJogadorController);

router.get('/listar/funcao', controller.listarFuncoesJogadorController);

router.put('/funcao/:jogadorId', controller.atualizarFuncaoJogadorController);

router.post('/atuacao', controller.atualizarAtuacaoController);

router.get('/partida/:partidaId/time/:timeId/jogadores', controller.listarJogadoresPartidaController);

module.exports = router;