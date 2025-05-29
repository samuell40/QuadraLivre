import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import AgendamentoView from '../views/AgendamentoView.vue';

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
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
