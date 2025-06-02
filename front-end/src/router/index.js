import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import AgendamentoView from '../views/AgendamentoView.vue';
import LoginView from '../views/LoginView.vue';
import CadastroView from '../views/CadastroView.vue';
import CadastrarQuadraView from '../views/CadastrarQuadraView.vue';
import ControlePlacarView from '../views/ControlePlacarView';

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
    path: '/cadastro',
    name: 'Cadastro',
    component: CadastroView,
  },
  {
    path: '/cadastrarquadra',
    name: 'cadastrar_quadra',
    component: CadastrarQuadraView,
  },
   {
    path: '/controleplacar',
    name: 'controle_placar',
    component: ControlePlacarView,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
