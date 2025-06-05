const express = require('express');
const http = require('http');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const multer = require("multer");
const dotenv = require("dotenv");
dotenv.config();

const app = express();

// Rotas
const userRouter = require('./routes/user.router');
const usuario = require('./routes/usuario.router');
const quadra = require('./routes/quadra.router');
const times = require('./routes/quadra.router');

// Configurações
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type'],
    exposedHeaders: ['Authorization']
}));

app.use(express.json());

// Prisma
const prisma = new PrismaClient();

// Uso das rotas
app.use(userRouter);
app.use(usuario);
app.use(quadra);
app.use(times);

// Teste de rota base
app.get('/', (req, res) => {
  res.send('API QuadraLivre funcionando!');
});

// Configuração do servidor
const PORT = 3000;
const server = http.createServer(app);

// Configuração do Multer (armazenamento em memória)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Configuração do Cliente S3 (Cloudflare R2)
const s3 = new S3Client({
    region: "auto",
    endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY,
        secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_KEY,
    },
});

// Rota de Upload
app.post("/upload", upload.single("file"), async (req, res) => {
    if (!req.file) {
        return res.status(400).send("Nenhum arquivo enviado.");
    }

    const fileName = `${Date.now()}_${req.file.originalname}`;
    const fileContent = req.file.buffer;

    const params = {
        Bucket: process.env.CLOUDFLARE_R2_BUCKET,
        Key: `uploads/${fileName}`,
        Body: fileContent,
        ContentType: req.file.mimetype,
        ACL: "public-read",
    };

    try {
        await s3.send(new PutObjectCommand(params));

        const fileUrl = `${process.env.URL_PUBLICA}/uploads/${fileName}`;
        res.status(200).json({ fileUrl });
    } catch (error) {
        console.error("Erro no upload:", error);
        res.status(500).json({ error: "Erro ao fazer upload do arquivo." });
    }
});

// Inicializa o servidor
server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});