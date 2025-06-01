const express = require('express');
const router = express.Router();
const controller = require('../controllers/quadra.controller');

router.post('/quadra', controller.adicionarQuadra);

module.exports = router;
