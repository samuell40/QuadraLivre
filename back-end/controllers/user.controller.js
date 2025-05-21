const { LoginUser } = require('../services/user.service');

async function LoginUsuario(req, res, next) {
    try {
        const login = await LoginUser(req.body); 
        res.status(200).json({ usuario: login.user });
    } catch (error) {
        console.error('Erro no login do usuário', error);
        res.status(400).json({ erro: error.message });
    }
}

module.exports = { LoginUsuario };
