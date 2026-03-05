const {
  obterChavePublicaPush,
  assinarPushUsuario,
  removerAssinaturaPushUsuario
} = require('../services/push-notification.service');

async function obterChavePublicaPushController(req, res) {
  const publicKey = obterChavePublicaPush();

  if (!publicKey) {
    return res.status(503).json({
      error: 'Notificacoes push indisponiveis no momento.'
    });
  }

  return res.status(200).json({ publicKey });
}

async function assinarPushController(req, res) {
  try {
    const usuarioId = Number(req.user?.id || 0);
    const subscription = req.body?.subscription || req.body;

    if (!usuarioId) {
      return res.status(401).json({ error: 'Usuario nao autenticado.' });
    }

    await assinarPushUsuario(usuarioId, subscription);

    return res.status(201).json({ success: true });
  } catch (error) {
    return res.status(400).json({
      error: error?.message || 'Nao foi possivel salvar a assinatura push.'
    });
  }
}

async function desassinarPushController(req, res) {
  try {
    const usuarioId = Number(req.user?.id || 0);
    const endpoint = String(req.body?.endpoint || req.body?.subscription?.endpoint || '').trim();

    if (!usuarioId) {
      return res.status(401).json({ error: 'Usuario nao autenticado.' });
    }

    if (!endpoint) {
      return res.status(400).json({ error: 'Endpoint de assinatura obrigatorio.' });
    }

    await removerAssinaturaPushUsuario(usuarioId, endpoint);

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(400).json({
      error: error?.message || 'Nao foi possivel remover a assinatura push.'
    });
  }
}

module.exports = {
  obterChavePublicaPushController,
  assinarPushController,
  desassinarPushController
};
