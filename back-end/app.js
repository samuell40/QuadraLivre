const express = require('express');
const { PrismaClient } = require('@prisma/client');
const app = express();
const PORT = 3000;

app.use(express.json());

// Inicializar o Prisma
const prisma = new PrismaClient();

app.get('/', (req, res) => {
  res.send('API QuadraLivre funcionando!');
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
