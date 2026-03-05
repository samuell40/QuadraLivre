const express = require('express');
const validarJWT = require('../middlewares/auth');
const controller = require('../controllers/push-notification.controller');

const router = express.Router();

router.get('/notificacoes/push/public-key', controller.obterChavePublicaPushController);
router.post('/notificacoes/push/subscribe', [validarJWT], controller.assinarPushController);
router.post('/notificacoes/push/unsubscribe', [validarJWT], controller.desassinarPushController);

module.exports = router;
