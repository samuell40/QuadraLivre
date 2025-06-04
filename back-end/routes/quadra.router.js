const express = require('express');
const router = express.Router();
const controller = require('../controllers/quadra.controller');

router.post('/quadra', controller.adicionarQuadra);

router.get('/quadra', controller.getQuadra)

router.get('/times', controller.nomeTime);

module.exports = router;
