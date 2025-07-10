<script setup>
import { ref } from "vue";

const file = ref(null);
const uploadStatus = ref("");
const imageUrl = ref("");

// Função para selecionar o arquivo
const handleFileChange = (event) => {
  file.value = event.target.files[0];
};

// Função para fazer upload do arquivo para o backend
const uploadFile = async () => {
  if (!file.value) {
    uploadStatus.value = "Por favor, selecione um arquivo.";
    return;
  }

  //FormData para enviar o arquivo
  const formData = new FormData();
  formData.append("file", file.value);

  try {
    // Enviando o arquivo para o backend
    const response = await fetch("https://quadra-livre-backend.onrender.com/upload", {
      method: "POST",
      body: formData,
    });
    const data = await response.json();

    console.log(data)
    alert(data.fileUrl)
  } catch (error) {
    console.error("Erro no upload:", error);
    uploadStatus.value = "Erro ao enviar o arquivo.";
  }
};
</script>

<template>
  <div class="upload-container">
    <input type="file" @change="handleFileChange" />
    <button @click="uploadFile">Enviar Imagem</button>
    <p>{{ uploadStatus }}</p>

    <!-- Exibe a imagem após o upload -->
    <div v-if="imageUrl">
      <p>Imagem carregada:</p>
      <img :src="imageUrl" alt="Imagem carregada" style="max-width: 300px; margin-top: 10px;" />
    </div>
  </div>
</template>

<style scoped>
.upload-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>