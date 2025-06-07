const express = require('express');
const passport = require('passport');
const router = express.Router();
const controller = require('../controllers/auth.controller');

router.get('/google', controller.iniciarLoginGoogle);

router.get('/google/callback', controller.callbackLoginGoogle);

router.get('/login/failure', controller.loginFalhou); 

module.exports = router;
