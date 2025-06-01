const { criarQuadra } = require('../services/quadra.service');

async function adicionarQuadra(req, res) {
    try {
        const dadosQuadra = req.body; // já com foto = URL da imagem
        const novaQuadra = await criarQuadra(dadosQuadra);
        res.status(201).json(novaQuadra);
    } catch (erro) {
        console.error('Erro ao adicionar quadra:', erro);
        res.status(500).json({ erro: 'Erro ao adicionar quadra' });
    }
};

module.exports = { adicionarQuadra };
