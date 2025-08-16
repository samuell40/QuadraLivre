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

    const redirectTo = (url) => {
      setTimeout(() => (window.location.href = url), 100);
    };

    let payload;

    if (erro) {
      payload = { erro, email };
    } else if (data) {
      payload = JSON.parse(decodeURIComponent(data));
    }

    if (window.opener?.postMessage) {
      window.opener.postMessage(payload, 'http://localhost:8080'); /*http://quadra-livre.vercel.app*/
      window.close();
    } else {
      if (payload?.erro === 'usuario_nao_cadastrado') {
        redirectTo(`/cadastro?email=${encodeURIComponent(payload.email || '')}`);
      } else if (payload?.token) {
        localStorage.setItem('token', payload.token);
        redirectTo('/agendarquadra');
      } else {
        redirectTo('/login');
      }
    }
  },
};
</script>
