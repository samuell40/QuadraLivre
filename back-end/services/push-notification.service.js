const webpush = require('web-push');
const prisma = require('../lib/prisma');

let configuracaoTentada = false;
let pushHabilitado = false;

function obterChavePublicaPush() {
  return String(process.env.VAPID_PUBLIC_KEY || '').trim();
}

function configurarPushSePossivel() {
  if (configuracaoTentada) return pushHabilitado;
  configuracaoTentada = true;

  const publicKey = obterChavePublicaPush();
  const privateKey = String(process.env.VAPID_PRIVATE_KEY || '').trim();
  const subject = String(
    process.env.VAPID_SUBJECT || 'mailto:contato@quadraplaysv.com.br'
  ).trim();

  if (!publicKey || !privateKey) {
    console.warn('[push] chaves VAPID ausentes. Web push desabilitado.');
    pushHabilitado = false;
    return pushHabilitado;
  }

  try {
    webpush.setVapidDetails(subject, publicKey, privateKey);
    pushHabilitado = true;
  } catch (error) {
    console.error('[push] falha ao configurar VAPID:', error?.message || error);
    pushHabilitado = false;
  }

  return pushHabilitado;
}

function statusNotificacaoPartida(status) {
  const statusNormalizado = String(status || '').toUpperCase();
  if (statusNormalizado === 'EM_ANDAMENTO') return 'AO VIVO';
  if (statusNormalizado === 'AGENDADA') return 'AGENDADA';
  if (statusNormalizado === 'ADIADA') return 'ADIADA';
  if (statusNormalizado === 'FINALIZADA') return 'FINALIZADA';
  if (statusNormalizado === 'CANCELADA') return 'CANCELADA';
  if (statusNormalizado === 'DELETADA') return 'ENCERRADA';
  return 'ATUALIZADA';
}

function montarPayloadNotificacaoPartida(payload = {}) {
  const partidaId = Number(payload?.partidaId || 0);
  const pontosTimeA = Number(payload?.pontosTimeA ?? 0);
  const pontosTimeB = Number(payload?.pontosTimeB ?? 0);
  const timeA = String(payload?.timeA || 'Time A');
  const timeB = String(payload?.timeB || 'Time B');
  const campeonatoNome = String(payload?.campeonatoNome || 'Campeonato');
  const status = String(payload?.status || '').toUpperCase();
  const quadra = String(payload?.quadra || '').trim();
  const encerrada = Boolean(payload?.encerrada);
  const titulo = `${timeA} ${pontosTimeA} x ${pontosTimeB} ${timeB}`;
  const body = [campeonatoNome, statusNotificacaoPartida(status), quadra]
    .filter(Boolean)
    .join(' | ');

  return {
    title: titulo,
    body,
    icon: '/ico.png',
    badge: '/ico.png',
    tag: `partida-live-${partidaId}`,
    renotify: true,
    requireInteraction: !encerrada,
    data: {
      partidaId,
      campeonatoId: Number(payload?.campeonatoId || 0) || null,
      status,
      url: partidaId
        ? `/visualizarplacarhome?partidaId=${partidaId}`
        : '/visualizarplacarhome'
    }
  };
}

function validarAssinatura(subscription = {}) {
  const endpoint = String(subscription?.endpoint || '').trim();
  const p256dh = String(subscription?.keys?.p256dh || '').trim();
  const auth = String(subscription?.keys?.auth || '').trim();

  if (!endpoint || !p256dh || !auth) {
    throw new Error('Assinatura push invalida.');
  }

  return {
    endpoint,
    keys: {
      p256dh,
      auth
    }
  };
}

async function assinarPushUsuario(usuarioId, subscription = {}) {
  const idUsuario = Number(usuarioId || 0);
  if (!idUsuario) {
    throw new Error('Usuario invalido para assinatura push.');
  }

  const assinatura = validarAssinatura(subscription);

  return prisma.pushSubscription.upsert({
    where: { endpoint: assinatura.endpoint },
    create: {
      usuarioId: idUsuario,
      endpoint: assinatura.endpoint,
      p256dh: assinatura.keys.p256dh,
      auth: assinatura.keys.auth
    },
    update: {
      usuarioId: idUsuario,
      p256dh: assinatura.keys.p256dh,
      auth: assinatura.keys.auth
    }
  });
}

async function removerAssinaturaPushUsuario(usuarioId, endpoint = '') {
  const idUsuario = Number(usuarioId || 0);
  const endpointNormalizado = String(endpoint || '').trim();

  if (!idUsuario || !endpointNormalizado) return { count: 0 };

  return prisma.pushSubscription.deleteMany({
    where: {
      usuarioId: idUsuario,
      endpoint: endpointNormalizado
    }
  });
}

async function enviarNotificacaoPushParaPartidas(payload = {}) {
  const partidaId = Number(payload?.partidaId || 0);
  if (!partidaId) return;
  if (!configurarPushSePossivel()) return;

  const subscriptions = await prisma.pushSubscription.findMany({
    where: {
      usuario: {
        ativo: true,
        deletedAt: null
      }
    },
    select: {
      id: true,
      endpoint: true,
      p256dh: true,
      auth: true
    }
  });

  if (!subscriptions.length) return;

  const mensagem = JSON.stringify(montarPayloadNotificacaoPartida(payload));

  const envios = subscriptions.map(async (item) => {
    const assinatura = {
      endpoint: item.endpoint,
      keys: {
        p256dh: item.p256dh,
        auth: item.auth
      }
    };

    try {
      await webpush.sendNotification(assinatura, mensagem, {
        TTL: 120,
        urgency: 'high'
      });
    } catch (error) {
      const statusCode = Number(error?.statusCode || 0);
      if (statusCode === 404 || statusCode === 410) {
        await prisma.pushSubscription.deleteMany({
          where: { endpoint: item.endpoint }
        });
        return;
      }

      console.warn(
        '[push] falha ao enviar notificacao:',
        statusCode || '-',
        error?.message || error
      );
    }
  });

  await Promise.allSettled(envios);
}

module.exports = {
  obterChavePublicaPush,
  assinarPushUsuario,
  removerAssinaturaPushUsuario,
  enviarNotificacaoPushParaPartidas
};
