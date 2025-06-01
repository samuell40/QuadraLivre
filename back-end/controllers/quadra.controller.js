const { criarQuadra } = require('../services/quadra.service');

async function adicionarQuadra (req, res) {
    try{
        const novaQuadra = await criarQuadra(req.body)
        res.status(201).json(novaQuadra);
    } catch(erro) {
        console.error('Erro ao adicionar quadra:', erro);
        res.status(500).json({  erro: 'Erro ao adicionar quadra' });
    }
};

module.exports = { adicionarQuadra };