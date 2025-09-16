<template>
  <div>
    <p>Processando login com Google...</p>
  </div>
</template>

<script>
export default {
  name: "GoogleCallback",
  mounted() {
    const params = new URLSearchParams(window.location.search);
    const erro = params.get("erro");
    const email = params.get("email");
    const data = params.get("data");

    let payload;
    if (erro) {
      payload = { erro, email };
    } else if (data) {
      payload = JSON.parse(decodeURIComponent(data));
    }

    if (window.opener) {
      window.opener.postMessage(payload, "http://localhost:8080");
      window.close(); 
    }
  }
};
</script>
