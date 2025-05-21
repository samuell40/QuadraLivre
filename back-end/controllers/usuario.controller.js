const Usuario = require('../services/usuario.service');
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const s3 = new S3Client({
    region: "auto",
    endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY,
        secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_KEY,
    },
});

async function postUsuario(req, res, next) {
    try {
        // Verificar se recebeu arquivo
        if (!req.file) {
            return res.status(400).json({ message: "Foto do usuário é obrigatória." });
        }

        // Fazer upload da imagem para o Cloudflare
        const fileName = `${Date.now()}_${req.file.originalname}`;
        const params = {
            Bucket: process.env.CLOUDFLARE_R2_BUCKET,
            Key: `uploads/${fileName}`,
            Body: req.file.buffer,
            ContentType: req.file.mimetype,
            ACL: "public-read",
        };
        await s3.send(new PutObjectCommand(params));
        const fileUrl = `${process.env.URL_PUBLICA}/uploads/${fileName}`;

        console.log('URL da imagem no Cloudflare:', fileUrl);

        // Preparar objeto com dados do usuário, incluindo a URL da foto
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
