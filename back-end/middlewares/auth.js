const config = require('../config/app.config.js');
const jwt = require('jsonwebtoken');

function validarJWT(req, res, next) {
  const authorization = String(req.headers.authorization || '').trim();

  if (!authorization) {
    return res.status(401).send({
      message: "Token ausente."
    });
  }

  if (!authorization.startsWith('Bearer ')) {
    return res.status(401).send({
      message: "Formato de token invalido."
    });
  }

  const jwt_token = authorization.split(' ')[1];
  if (!jwt_token) {
    return res.status(401).send({
      message: "Token ausente."
    });
  }

  jwt.verify(jwt_token, config.jwtSecret, (err, userInfo) => {
    if (err) {
      console.log(err);
      if (err.name === "TokenExpiredError") {
        return res.status(401).send({
          message: "Token Expirado."
        });
      }
      return res.status(403).send({
        message: "Token invalido"
      });
    }
    req.user = userInfo;
    next();
  });
}

module.exports = validarJWT;
