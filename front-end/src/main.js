// src/main.js
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia, setActivePinia } from 'pinia';
import { useAuthStore } from './store';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const app = createApp(App);

// 🔹 Configura e ativa o Pinia
const pinia = createPinia();
setActivePinia(pinia);
app.use(pinia);

// 🔹 Usa o Vue Router
app.use(router);

// 🔹 Monta o app
app.mount('#app');

const authStore = useAuthStore();
authStore.carregarDados();
