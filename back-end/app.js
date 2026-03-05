const express = require('express');
const http = require('http');
const cors = require('cors');
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const multer = require("multer");
const dotenv = require("dotenv");
dotenv.config();
const passport = require("./auth/passport");
const prisma = require('./lib/prisma');
const { iniciarSocket } = require('./socket');

// Rotas
const authRoutes = require("./routes/auth.router");
const partida = require('./routes/partida.router');
const usuario = require('./routes/usuario.router');
const jogador = require('./routes/jogador.router');
const treinador = require('./routes/treinador.router');
const quadra = require('./routes/quadra.router');
const placar = require('./routes/placar.router');
const agendamento = require('./routes/agendamento.router');
const time = require('./routes/time.router');
const modalidade = require('./routes/modalidade.router');
const campeonato = require('./routes/campeonatos.router');
const avisos = require('./routes/aviso.router');
const horarioQuadra = require('./routes/horario_quadra.router');
const pushNotification = require('./routes/push-notification.router');
//const { FirstRun } = require('./firstRun');

// Inicialização
const app = express();
app.set('trust proxy', 1);

const server = http.createServer(app);

iniciarSocket(server);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = [
  'https://www.quadraplaysv.com.br',
  'https://quadraplaysv.com.br',
  'http://localhost:5173',
  'http://localhost:3000',
];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);

    if (allowedOrigins.includes(origin)) return cb(null, true);

    return cb(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type'],
}));

app.use(passport.initialize());

// Rotas
app.use("/auth", authRoutes);
app.use(usuario);
app.use(jogador);
app.use(treinador);
app.use(quadra);
app.use(placar);
app.use(partida);
app.use(agendamento);
app.use(time);
app.use(modalidade);
app.use(campeonato);
app.use(avisos);
app.use(horarioQuadra);
app.use(pushNotification);
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
  console.log(`Servidor rodando na porta ${PORT}`);
});

async function encerrarServidor(signal) {
  console.log(`${signal} recebido. Encerrando servidor...`);

  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGINT', () => {
  encerrarServidor('SIGINT').catch((error) => {
    console.error('Erro ao encerrar servidor:', error);
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  encerrarServidor('SIGTERM').catch((error) => {
    console.error('Erro ao encerrar servidor:', error);
    process.exit(1);
  });
});
