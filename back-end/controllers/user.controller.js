const { LoginUser } = require('../services/user.service');


async function LoginUsuario(req, res, next) {
     console.log('req.body:', req.body); 
    try {
        const login = await LoginUser(req.body); // req.body = { email, senha }
        res.status(200).json({ usuario: login.user });
    } catch (error) {
        console.error('Erro no login do usuário', error);
        res.status(400).json({ erro: error.message });
    }
}

module.exports = { LoginUsuario };
