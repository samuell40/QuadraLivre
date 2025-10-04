const express = require('express');
const controller = require('../controllers/placar.controller');
const validarJWT = require('../middlewares/auth');
const verificarPermissao  = require('../services/permissions/permissions.usuario.service.js');

const router = express.Router();

router.post(
  '/placar',
  [validarJWT],
  verificarPermissao.devAdmin,
  controller.criarPlacarController
);

router.put(
  '/placar/:id',
  [validarJWT],
  verificarPermissao.devAdmin,
  controller.atualizarPlacarController
);

router.get(
  '/placar/modalidade/:modalidadeId',
  controller.listarPlacarPorModalidadeController
);

router.put(
  '/placar/reset/:modalidadeId',
  [validarJWT],
  verificarPermissao.devAdmin,
  controller.resetarPlacarPorModalidadeController
);

router.put(
  '/ocultar',
  [validarJWT],
  verificarPermissao.devAdmin,
  controller.ocultarPlacarGeralController
);

router.put(
  '/ocultar/:modalidadeId',
  [validarJWT],
  controller.ocultarPlacarPorModalidadeController
);

router.put(
  '/mostrar',
  [validarJWT],
  verificarPermissao.devAdmin,
  controller.mostrarPlacarGeralController
);

router.put(
  '/mostrar/:modalidadeId',
  [validarJWT],
  verificarPermissao.devAdmin,
  controller.mostrarPlacarPorModalidadeController
);

router.get(
  '/visibilidade',
  controller.listarVisibilidadeController
);

module.exports = router;