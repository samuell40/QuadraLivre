<template>
  <div>
    <p>Processando login com Google...</p>
  </div>
</template>

<script>
export default {
  name: 'GoogleCallback',
  mounted() {
    const params = new URLSearchParams(window.location.search);
    const erro = params.get('erro');
    const email = params.get('email');
    const data = params.get('data');

    const payload = erro
      ? { erro, email }
      : data
        ? (() => {
            try {
              return JSON.parse(decodeURIComponent(data));
            } catch {
              return { erro: 'erro_interno' };
            }
          })()
        : { erro: 'erro_desconhecido' };

    // Verifica se foi aberto como popup (desktop)
    if (window.opener && typeof window.opener.postMessage === 'function') {
      window.opener.postMessage(payload, 'https://quadra-livre.vercel.app');
      window.close();
    } else {
      // Fallback para mobile: salva no localStorage e redireciona para a home
      localStorage.setItem('google_login', JSON.stringify(payload));
      window.location.href = 'https://quadra-livre.vercel.app';
    }
  },
};
</script>
