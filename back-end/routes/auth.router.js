const express = require('express');
const passport = require('passport');
const controller = require('../controllers/auth.controller');
const router = express.Router();

router.get('/google', controller.iniciarLoginGoogle);

router.get('/google/callback', controller.callbackLoginGoogle);

module.exports = router;
