import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import AgendamentoView from '../views/AgendamentoView.vue';
import LoginView from '../views/LoginView.vue';
import CadastrarQuadraView from '../views/CadastrarQuadraView.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
  },
  {
    path: '/agendamento',
    name: 'Agendamento',
    component: AgendamentoView,
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
  },
  {
    path: '/cadastrarquadra',
    name: 'cadastrar_quadra',
    component: CadastrarQuadraView,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
