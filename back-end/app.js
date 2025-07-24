const express = require('express');
const http = require('http');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const multer = require("multer");
const dotenv = require("dotenv");
dotenv.config();
const session = require("express-session");
const passport = require("./auth/passport");

// Rotas
const authRoutes = require("./routes/auth.router");
const usuario = require('./routes/usuario.router');
const quadra = require('./routes/quadra.router');
const placar = require('./routes/placar.router');
//const { FirstRun } = require('./firstRun');

// Inicialização
const app = express();
const server = http.createServer(app);
const prisma = new PrismaClient();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:8080',
      'http://192.168.0.190:8080',
      'https://quadra-livre.vercel.app'
    ];

    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app')
    ) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Session + Passport
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

// Rotas
app.use("/auth", authRoutes);
app.use(usuario);
app.use(quadra);
app.use(placar);
//FirstRun();

// Rota base
app.get('/', (req, res) => {
  res.send('API QuadraLivre funcionando!');
});

// Cloudflare R2 + Multer para upload de arquivos
const storage = multer.memoryStorage();
const upload = multer({ storage });

const s3 = new S3Client({
    region: "auto",
    endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY,
        secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_KEY,
    },
});

app.post("/upload", upload.single("file"), async (req, res) => {
    if (!req.file) return res.status(400).send("Nenhum arquivo enviado.");

    const fileName = `${Date.now()}_${req.file.originalname}`;
    const params = {
        Bucket: process.env.CLOUDFLARE_R2_BUCKET,
        Key: `uploads/${fileName}`,
        Body: req.file.buffer,
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
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
