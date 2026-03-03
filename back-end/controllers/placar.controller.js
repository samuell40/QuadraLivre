const placarService = require('../services/placar.service');
const { emitirAtualizacaoCampeonato } = require('../socket');

async function atualizarPlacarController(req, res) {
  try {
    const { id } = req.params;
    const campos = req.body;

    if (!id) {
      return res.status(400).json({ erro: 'ID do placar é obrigatório.' });
    }
    const placar = await placarService.atualizarPlacar(id, campos);

    return res.status(200).json({
      mensagem: 'Placar atualizado com sucesso.',
      placar
    });

  } catch (error) {
    return res.status(500).json({ erro: error.message });
  }
}

async function listarPlacarPorCampeonatoController(req, res) {
  try {
    const { campeonatoId } = req.params;

    if (!campeonatoId) {
      return res.status(400).json({
        erro: 'campeonatoId é obrigatório.'
      });
    }

    const placares = await placarService.listarPlacarPorCampeonato(Number(campeonatoId));

    return res.status(200).json({ placares });

  } catch (error) {
    return res.status(500).json({ erro: error.message });
  }
}

async function salvarOrdemController(req, res) {
  try {
    const { campeonatoId } = req.params
    const { ordem, colunas, grupos } = req.body
    const corpoTemGrupos = Object.prototype.hasOwnProperty.call(req.body || {}, 'grupos')

    const temOrdem = Array.isArray(ordem)
    const temColunas = Array.isArray(colunas)
    const gruposValidos = grupos === null || (!!grupos && typeof grupos === 'object' && !Array.isArray(grupos))

    if (!temOrdem && !temColunas && !corpoTemGrupos) {

      return res.status(400).json({
        erro: "ordem, colunas e/ou grupos devem ser enviados em formato valido"
      })

    }

    if (corpoTemGrupos && !gruposValidos) {
      return res.status(400).json({
        erro: "grupos deve ser um objeto ou null"
      })
    }

    const resultado = await placarService.salvarOrdemClassificacao(
      campeonatoId,
      temOrdem ? ordem : null,
      temColunas ? colunas : null,
      corpoTemGrupos ? grupos : undefined
    )

    emitirAtualizacaoCampeonato({
      tipo: 'CLASSIFICACAO_ATUALIZADA',
      campeonatoId: Number(campeonatoId)
    })

    return res.json({
      message: "Configuracao salva com sucesso",
      data: resultado
    })

  }
  catch (error) {
    return res.status(500).json({
      erro: error.message
    })
  }
}

async function listarOrdemClassificacaoController(req, res) {
  try {
    const { campeonatoId } = req.params;
    const configuracao = await placarService.listarOrdemClassificacao(Number(campeonatoId));
    res.json({
      campeonatoId,
      ordem: configuracao?.ordem || [],
      colunas: configuracao?.colunas || [],
      grupos: configuracao?.grupos || null
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
}

module.exports = { atualizarPlacarController, listarPlacarPorCampeonatoController, salvarOrdemController, listarOrdemClassificacaoController };
