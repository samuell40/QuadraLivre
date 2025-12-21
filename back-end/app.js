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
const partida = require('./routes/partida.router')
const usuario = require('./routes/usuario.router');
const jogador = require('./routes/jogador.router')
const quadra = require('./routes/quadra.router');
const placar = require('./routes/placar.router');
const agendamento = require('./routes/agendamento.router');
const time = require('./routes/time.router');
const modalidade = require('./routes/modalidade.router');
const campeonato = require('./routes/campeonatos.router');
//const { FirstRun } = require('./firstRun');

// Inicialização
const app = express();
const server = http.createServer(app);
const prisma = new PrismaClient();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type'],
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
app.use(jogador);
app.use(quadra);
app.use(placar);
app.use(partida)
app.use(agendamento);
app.use(time)
app.use(modalidade)
app.use(campeonato)
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
