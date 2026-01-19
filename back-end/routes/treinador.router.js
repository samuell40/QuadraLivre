const express = require('express');
const router = express.Router();
const controller = require('../controllers/treinador.controller');

router.post('/vincular/treinador', controller.tornarTreinador);

module.exports = router;