<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <div class="svg-container">
        <img src="@/assets/icons/atencao.svg" width="100" height="100" alt="Alerta de login" />
      </div>
      <h2>Você precisa estar logado!</h2>
      <p>Faça login ou crie uma conta para acessar uma quadra.</p>
      <div class="botoes-modal">
        <button class="login" @click="$emit('loginComGoogle')">Login</button>
        <button class="voltar" @click="$emit('fechar')">Voltar</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'loginComGoogle'
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 16px;
  box-sizing: border-box;
}

.modal-content {
  background: #fff;
  padding: 48px 32px;
  border-radius: 8px;
  width: 100%;
  max-width: 600px;
  text-align: center;
  font-family: "Montserrat", sans-serif;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
  z-index: 10000;
}

.svg-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 16px;
}

.modal-content h2 {
  margin-bottom: 20px;
  font-size: 36px;
  color: #3B82F6;
  font-weight: bold;
}

.modal-content p {
  font-size: 16px;
  margin-bottom: 32px;
  color: #7e7e7e;
}

.botoes-modal {
  display: flex;
  justify-content: center;
  gap: 40px;
  flex-wrap: wrap;
}

button {
  padding: 10px 20px;
  width: 42%;
  font-weight: bold;
  font-family: "Montserrat", sans-serif;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  transition: 0.3s;
  box-sizing: border-box;
}

button.login {
  background-color: #3B82F6;
  color: white;
}

button.voltar {
  background-color: #F5F5F5;
  color: #7e7e7e;
}

button.login:hover {
  opacity: 0.7;
}

button.voltar:hover {
  color: #6e6e6e;
}

@media (max-width: 480px) {
  .modal-content {
    padding: 40px 16px;
  }

  .modal-content h2 {
    font-size: 28px;
  }

  .botoes-modal {
    flex-direction: column;
    gap: 16px;
  }

  button {
    width: 100%;
  }
}
</style>
