const config = require('../config/app.config.js');
const jwt = require('jsonwebtoken');

function validarJWT(req, res, next) {
    // Verifica se o token foi fornecido
    if (!req.headers.authorization) {
        return res.status(422).send({
            message: "Token nulo"
        });
    }

    // Extrai o token do header
    const jwt_token = req.headers.authorization.split(' ')[1];
    // Verifica se o token está expirado ou válido
    jwt.verify(jwt_token, config.jwtSecret, (err, userInfo) => {

        if (err) {
            console.log(err);
            if (err.name === "TokenExpiredError") {
                return res.status(401).send({
                    message: "Token Expirado."
                });
            } else {
                return res.status(403).send({
                    message: "Token inválido"
                });
            }
        }
        req.user = userInfo;
        next();
    });
}

module.exports = validarJWT;