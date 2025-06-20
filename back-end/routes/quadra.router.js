const express = require('express');
const controller = require('../controllers/quadra.controller');
const router = express.Router();

router.post('/quadra', controller.adicionarQuadra);

router.get('/quadra', controller.getQuadra)

module.exports = router;
