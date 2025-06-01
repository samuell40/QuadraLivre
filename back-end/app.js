const express = require('express');
const http = require('http');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const multer = require("multer");
const path = require("path");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const userRouter = require('./routes/user.router');
const usuario = require('./routes/usuario.router');
const quadra = require('./routes/quadra.router');

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type'],
    exposedHeaders: ['Authorization']

}));

app.use(express.json());
app.use(userRouter)
app.use(usuario)
app.use(quadra)

// Inicializar o Prisma
const prisma = new PrismaClient();

app.get('/', (req, res) => {
  res.send('API QuadraLivre funcionando!');
});

const PORT = 3000;
const server = http.createServer(app);

/*
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Configuração do Cliente S3 (Cloudflare R2)
const s3 = new S3Client({
    region: "auto",
    endpoint: process.env.CLOUDFLARE_R2_ENDPOINT, // Endpoint do seu R2
    credentials: {
        accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY,
        secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_KEY,
    },
});

app.post("/upload", upload.single("file"), async (req, res) => {
    if (!req.file) {
        return res.status(400).send("Nenhum arquivo enviado.");
    }

    const fileName = `${Date.now()}_${req.file.originalname}`; // Gerar um nome único para o arquivo
    const fileContent = req.file.buffer;

    // Configurações do upload para o Cloudflare R2
    const params = {
        Bucket: process.env.CLOUDFLARE_R2_BUCKET,
        Key: `uploads/${fileName}`, // Caminho do arquivo no R2
        Body: fileContent,
        ContentType: req.file.mimetype,
        ACL: "public-read", // Permite que o arquivo seja acessado publicamente
    };

    try {
        // Envia o arquivo para o Cloudflare R2
        await s3.send(new PutObjectCommand(params));

        // URL pública do arquivo-
        const fileUrl = `${process.env.URL_PUBLICA}.r2.dev/uploads/${fileName}`;
        console.log(fileUrl)
        res.status(200).json({ fileUrl }); // Retorna a URL pública do arquivo
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao fazer upload do arquivo." });
    }
});
*/

server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});