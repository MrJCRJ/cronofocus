/**
 * CronoFocus - Vue Router
 * Configuração de rotas com guards de autenticação
 */

import { createRouter, createWebHistory } from 'vue-router'

// Store será importado dentro do guard para evitar problemas de inicialização
let authStoreInstance = null

// Lazy load das views
const LoginView = () => import('@/views/LoginView.vue')
const HomeView = () => import('@/views/HomeView.vue')
const PlanView = () => import('@/views/PlanView.vue')
const ExecuteView = () => import('@/views/ExecuteView.vue')
const ReviewView = () => import('@/views/ReviewView.vue')
const HistoryView = () => import('@/views/HistoryView.vue')
const ExportView = () => import('@/views/ExportView.vue')
const SettingsView = () => import('@/views/SettingsView.vue')

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: {
      requiresAuth: false,
      title: 'Login'
    }
  },
  {
    path: '/home',
    name: 'Home',
    component: HomeView,
    meta: {
      requiresAuth: true,
      title: 'Agenda do Dia',
      icon: 'home'
    }
  },
  {
    path: '/plan',
    name: 'Plan',
    component: PlanView,
    meta: {
      requiresAuth: true,
      title: 'Planejar',
      icon: 'calendar'
    }
  },
  {
    path: '/execute',
    name: 'Execute',
    component: ExecuteView,
    meta: {
      requiresAuth: true,
      title: 'Executar',
      icon: 'play'
    }
  },
  {
    path: '/execute/:taskId',
    name: 'ExecuteTask',
    component: ExecuteView,
    meta: {
      requiresAuth: true,
      title: 'Timer',
      icon: 'clock'
    }
  },
  {
    path: '/review',
    name: 'Review',
    component: ReviewView,
    meta: {
      requiresAuth: true,
      title: 'Análise',
      icon: 'chart'
    }
  },
  {
    path: '/history',
    name: 'History',
    component: HistoryView,
    meta: {
      requiresAuth: true,
      title: 'Histórico',
      icon: 'history'
    }
  },
  {
    path: '/export',
    name: 'Export',
    component: ExportView,
    meta: {
      requiresAuth: true,
      title: 'Exportar',
      icon: 'download'
    }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: SettingsView,
    meta: {
      requiresAuth: true,
      title: 'Configurações',
      icon: 'settings'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/home'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  }
})

// Navigation Guards
router.beforeEach(async (to, from, next) => {
  // Lazy load do store para evitar problemas de inicialização
  let authStore
  try {
    const { useAuthStore } = await import('@/stores/authStore')
    authStore = useAuthStore()
  } catch (error) {
    console.error('Erro ao carregar authStore:', error)
    next()
    return
  }

  // Inicializar auth se necessário
  if (!authStore.initialized) {
    try {
      await authStore.initialize()
    } catch (error) {
      console.error('Erro ao inicializar auth:', error)
    }
  }

  // Atualizar título da página
  document.title = to.meta.title
    ? `${to.meta.title} | CronoFocus`
    : 'CronoFocus'

  // Verificar autenticação
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    // Salvar rota pretendida
    localStorage.setItem('cronofocus_redirect', to.fullPath)
    next({ name: 'Login' })
    return
  }

  // Se já logado e tentando acessar login, redirecionar
  if (to.name === 'Login' && authStore.isLoggedIn) {
    const redirect = localStorage.getItem('cronofocus_redirect')
    localStorage.removeItem('cronofocus_redirect')
    next(redirect || { name: 'Home' })
    return
  }

  next()
})

// After each navigation
router.afterEach((to, from) => {
  // Analytics ou logging pode ser adicionado aqui
})

export default router
