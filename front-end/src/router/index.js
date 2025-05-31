import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import AgendamentoView from '../views/AgendamentoView.vue';
import CadastrarQuadraView from '../views/CadastrarQuadraView.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
  },

    {
    path: '/agendamento',
    name: 'agendamento',
    component: AgendamentoView,
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
