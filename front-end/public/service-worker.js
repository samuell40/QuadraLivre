self.addEventListener('push', (event) => {
  let payload = {};

  try {
    payload = event.data ? event.data.json() : {};
  } catch (error) {
    payload = {
      title: 'Atualizacao de partida',
      body: event.data ? event.data.text() : ''
    };
  }

  const title = String(payload?.title || 'Atualizacao de partida');
  const options = {
    body: String(payload?.body || ''),
    icon: String(payload?.icon || '/ico.png'),
    badge: String(payload?.badge || '/ico.png'),
    tag: String(payload?.tag || 'partida-live'),
    renotify: Boolean(payload?.renotify),
    requireInteraction: Boolean(payload?.requireInteraction),
    data: payload?.data || {}
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const data = event.notification?.data || {};
  const urlRelativa = String(data?.url || '/visualizarplacarhome');
  const urlDestino = new URL(urlRelativa, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((lista) => {
      for (const cliente of lista) {
        if (typeof cliente.focus === 'function' && cliente.url === urlDestino) {
          return cliente.focus();
        }
      }

      if (lista.length > 0) {
        const primeiroCliente = lista[0];
        if (typeof primeiroCliente.navigate === 'function') {
          return primeiroCliente.navigate(urlDestino).then(() => primeiroCliente.focus());
        }
        if (typeof primeiroCliente.focus === 'function') {
          return primeiroCliente.focus();
        }
      }

      if (clients.openWindow) {
        return clients.openWindow(urlDestino);
      }

      return null;
    })
  );
});
