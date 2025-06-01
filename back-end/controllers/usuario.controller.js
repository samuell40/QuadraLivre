const Usuario = require('../services/usuario.service');

async function postUsuario(req, res, next) {
    try {
        const userData = {
            usuario: {
                nome: req.body.nome,
                email: req.body.email,
                senha: req.body.senha,
                foto: fileUrl,
                permissaoId: 1,
                quadraId: req.body.quadraId,
            }
        };

        // Chamar service para salvar usuário
        const cadastro = await Usuario.postUsuario(userData);
        res.status(201).json({ cadastro });
        next();

    } catch (error) {
        console.error('Erro ao cadastrar usuario:', error);

        if (error.code === 'P2002') {  // e-mail duplicado
            return res.status(409).json({ message: 'E-mail já cadastrado!' });
        }

        return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
}

module.exports = { postUsuario };
