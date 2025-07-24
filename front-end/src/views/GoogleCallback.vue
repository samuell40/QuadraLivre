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

    if (erro) {
      window.opener.postMessage({ erro, email }, 'https://quadra-livre.vercel.app');
      window.close();
      return;
    }

    if (data) {
      try {
        const parsed = JSON.parse(decodeURIComponent(data));
        window.opener.postMessage(parsed, 'https://quadra-livre.vercel.app');
      } catch {
        window.opener.postMessage({ erro: 'erro_interno' }, 'https://quadra-livre.vercel.app');
      }
      window.close();
    } else {
      window.opener.postMessage({ erro: 'erro_desconhecido' }, 'https://quadra-livre.vercel.app');
      window.close();
    }
  },
};
</script>
