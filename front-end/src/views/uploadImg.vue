<script setup>
import { ref } from "vue";
import api from "@/axios"; 
import Swal from "sweetalert2";

const file = ref(null);
const uploadStatus = ref("");
const imageUrl = ref("");

const handleFileChange = (event) => {
  file.value = event.target.files[0];
};

const uploadFile = async () => {
  if (!file.value) {
    uploadStatus.value = "Por favor, selecione um arquivo.";
    return;
  }

  const formData = new FormData();
  formData.append("file", file.value);

  try {
    const response = await api.post("/upload", formData); 
    imageUrl.value = response.data.fileUrl;
    uploadStatus.value = "Upload realizado com sucesso!";

    Swal.fire({
      icon: "success",
      title: "Sucesso!",
      text: "Imagem enviada com sucesso.",
    });

  } catch (error) {
    console.error("Erro no upload:", error);
    uploadStatus.value = "Erro ao enviar o arquivo.";
    Swal.fire({
      icon: "error",
      title: "Erro",
      text: error.response?.data?.error || "Falha ao enviar a imagem.",
    });
  }
};
</script>

<template>
  <div class="upload-container">
    <input type="file" @change="handleFileChange" />
    <button @click="uploadFile">Enviar Imagem</button>
    <p>{{ uploadStatus }}</p>

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