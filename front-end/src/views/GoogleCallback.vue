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

  const redirecionar = (url) => {
    setTimeout(() => {
      window.location.href = url;
    }, 100);
  };

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

  if (window.opener && typeof window.opener.postMessage === 'function') {
    window.opener.postMessage(payload, 'https://quadra-livre.vercel.app');
    window.close();
  } else {
    if (payload.erro === 'usuario_nao_cadastrado') {
      redirecionar(`/cadastro?email=${encodeURIComponent(payload.email || '')}`);
    } else if (payload.token) {
      localStorage.setItem('token', payload.token);
      redirecionar('/agendarquadra');
    } else {
      redirecionar('/');
    }
  }
}
}

</script>
