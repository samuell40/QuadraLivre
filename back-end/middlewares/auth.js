const config = require('../config/app.config.js');
const jwt = require('jsonwebtoken');

function validarJWT(req, res, next) {
  const jwt_token = req.cookies?.token; // Lê o token do cookie

  if (!jwt_token) {
    return res.status(401).json({ message: "Token não fornecido." });
  }

  jwt.verify(jwt_token, config.jwtSecret, (err, userInfo) => {
    if (err) {
      console.log(err);
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token expirado." });
      } else {
        return res.status(403).json({ message: "Token inválido." });
      }
    }

    req.user = userInfo; 
    next();
  });
}

module.exports = validarJWT;
