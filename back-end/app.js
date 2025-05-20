const express = require('express');
const { PrismaClient } = require('@prisma/client');
const app = express();
const PORT = 3000;
const cors = require('cors');
const dotenv = require("dotenv");
dotenv.config();
const userRouter = require('./routes/user.router');
const usuario = require('./routes/usuario.router');


app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type'],
    exposedHeaders: ['Authorization']

}));

app.use(express.json());
app.use(userRouter)
app.use(usuario)

// Inicializar o Prisma
const prisma = new PrismaClient();

app.get('/', (req, res) => {
  res.send('API QuadraLivre funcionando!');
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
