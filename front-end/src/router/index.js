import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import DashboardView from '@/views/DashboardView.vue';
import AgendamentosView from '../views/AgendamentosView.vue';
import NaoAutorizado from '@/views/NaoAutorizado.vue';
import CadastroView from '../views/CadastroView.vue';
import CadastrarQuadraView from '../views/CadastrarQuadraView.vue';
import GerenciarQuadrasView from '@/views/GerenciarQuadrasView.vue';
import VisualizarPlacarHomeView from '@/views/VisualizarPlacarHomeView.vue';
import GerenciarPartidaView from '@/views/quadra_play/GerenciarPartidaView.vue';
import UsuariosView from '../views/UsuariosView';
import MeusAgendamentosView from '../views/usuario/MeusAgendamentosView.vue';
import AgendarQuadrasView from '@/views/usuario/AgendarQuadrasView.vue';
import AgendarQuadrasAdmView from '@/views/AgendarQuadrasAdmView.vue';
import HorariosView from '@/views/HorariosView.vue';
import GoogleCallback from '@/views/GoogleCallback.vue';
import GerenciartimesView from '@/views/quadra_play/GerenciartimesView.vue';
import TimesHomeView from '@/views/TimesView.vue';
import GerenciarModalidadesView from '@/views/GerenciarModalidadesView.vue';
import DetalharCampeonatosView from '@/views/quadra_play/DetalharCampeonatosView.vue';
import ClassificacaoView from '@/views/quadra_play/ClassificacaoView.vue';
import MeusAvisosView from '../views/usuario/MeusAvisosView.vue';
import telaInicialView from '@/views/quadra_play/telaInicialView.vue';

const QUADRA_PLAY_LOGIN_KEY = 'quadraPlayLoginAtivo';
const ROTAS_EXCECAO_QUADRA_PLAY = new Set(['NaoAutorizado', 'GoogleCallback']);

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
    meta: { public: true },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardView,
    meta: { requiresAuth: true, roles: [1, 2] },
  },
  {
    path: '/agendamentos',
    name: 'Agendamentos',
    component: AgendamentosView,
    meta: { public: true, roles: [2] },
  },
  {
    path: '/agendarquadra',
    name: 'agendar_quadra',
    component: AgendarQuadrasView,
    meta: { requiresAuth: true, roles: [3] },
  },
  {
    path: '/agendarquadrasadm',
    name: 'agendar_quadra_adm',
    component: AgendarQuadrasAdmView,
    meta: { requiresAuth: true, roles: [1, 2] },
  },
  {
    path: '/meusagendamentos',
    name: 'meus_agendamentos',
    component: MeusAgendamentosView,
    meta: { requiresAuth: true, roles: [3] },
  },
  {
    path: '/meusavisos',
    name: 'meus_avisos',
    component: MeusAvisosView,
    meta: { requiresAuth: true, roles: [3] },
  },
  {
    path: '/cadastrarquadra',
    name: 'cadastrar_quadra',
    component: CadastrarQuadraView,
    meta: { requiresAuth: true, roles: [1, 2] },
  },
  {
    path: '/gerenciarquadras',
    name: 'gerenciar_quadras',
    component: GerenciarQuadrasView,
    meta: { requiresAuth: true, roles: [1, 2] },
  },
  {
    path: '/gerenciartimes',
    name: 'gerenciar_times',
    component: GerenciartimesView,
    meta: { requiresAuth: true, roles: [1, 2], requiresQuadraPlayLogin: true },
  },
   {
    path: '/times',
    name: 'times',
    component: TimesHomeView,
    meta: { public: true },
  },
  {
    path: '/gerenciarpartida',
    name: 'gerenciar_partida',
    component: GerenciarPartidaView,
    meta: { requiresAuth: true, roles: [1, 2, 4], requiresQuadraPlayLogin: true },
  },
  {
    path: '/partida',
    name: 'Partida',
    component: () => import('@/views/quadra_play/PartidaView.vue'),
    meta: { requiresAuth: true, roles: [1, 2, 4], requiresQuadraPlayLogin: true }
  },
  {
    path: '/visualizarplacarhome',
    name: 'visualizar_placarhome',
    component: VisualizarPlacarHomeView,
    meta: { public: true},
  },
  {
    path: '/usuarios',
    name: 'usuarios',
    component: UsuariosView,
    meta: { requiresAuth: true, roles: [1, 2] },
  },
  {
    path: '/NaoAutorizado',
    name: 'NaoAutorizado',
    component: NaoAutorizado,
    meta: { public: true },
  },
  {
    path: '/google-callback',
    name: 'GoogleCallback',
    component: GoogleCallback,
    meta: { public: true },
  },
  {
    path: '/cadastro',
    name: 'Cadastro',
    component: CadastroView,
    meta: { public: true },
  },
  {
    path: '/horarios',
    name: 'Horarios',
    component: HorariosView,
    meta: { public: true },
  },

  {
    path: '/modalidades',
    name: 'Modalidades',
    component: GerenciarModalidadesView,
    meta: { public: true },
  },
  {
    path: '/telainicial',
    name: 'TelaInicial',
    component: telaInicialView,
    meta: { requiresAuth: true, roles: [1, 2, 4], requiresQuadraPlayLogin: true },
  },
  {
    path: '/detalharcampeonatos',
    name: 'Detalhar_Campeonatos',
    component: DetalharCampeonatosView,
    meta: { requiresAuth: true, roles: [1, 2, 4], requiresQuadraPlayLogin: true },
  },
   {
    path: '/classificacao',
    name: 'Classificacao',
    component: ClassificacaoView,
    meta: { requiresAuth: true, roles: [1, 2, 4], requiresQuadraPlayLogin: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0 }
  }
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
  const loginQuadraPlayAtivo = localStorage.getItem(QUADRA_PLAY_LOGIN_KEY) === '1';
  const redirect = to.fullPath;

  if (to.meta.requiresAuth && !token) {
    return next({ name: 'NaoAutorizado', query: { redirect } });
  }

  if (to.meta.requiresQuadraPlayLogin && !loginQuadraPlayAtivo) {
    return next({ name: 'NaoAutorizado', query: { redirect } });
  }

  if (
    loginQuadraPlayAtivo &&
    !to.meta.requiresQuadraPlayLogin &&
    !ROTAS_EXCECAO_QUADRA_PLAY.has(to.name)
  ) {
    return next({ name: 'NaoAutorizado', query: { redirect } });
  }

  if (to.meta.roles && usuario) {
    if (!to.meta.roles.includes(usuario.permissaoId)) {
      return next({ name: 'NaoAutorizado', query: { redirect } });
    }
  }

  next();
});

export default router;
