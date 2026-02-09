// src/main.js
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';
import { useAuthStore } from './store';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './assets/main.css';

const app = createApp(App);

// 🔹 Cria e usa Pinia
const pinia = createPinia();
app.use(pinia);

// 🔹 Usa o Vue Router
app.use(router);

// 🔹 Monta o app
app.mount('#app');

// 🔹 Carrega dados da store de autenticação
const authStore = useAuthStore();
authStore.carregarDados();