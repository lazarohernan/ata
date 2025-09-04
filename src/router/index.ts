import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

// Vistas
import Login from '../views/Login.vue';
import DashboardList from '../views/DashboardList.vue';
import DataSources from '../views/DataSources.vue';
import DashboardView from '../views/DashboardView.vue';
import AT2Reports from '../views/AT2Reports.vue';
import Layout from '../components/Layout.vue';

const routes = [
  // Ruta de login (sin protección)
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },

  // Rutas protegidas envueltas en Layout
  {
    path: '/',
    component: Layout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'HomeDashboard',
        component: DashboardView,
        props: {
          hideHeader: false,
          hideMetrics: false,
          hideCharts: false,
          hideFooter: false
        }
      },
      {
        path: '/dashboards',
        name: 'DashboardList',
        component: DashboardList
      },
      {
        path: '/data-sources',
        name: 'DataSources',
        component: DataSources
      },
      {
        path: '/dashboard/:id',
        name: 'DashboardView',
        component: DashboardView
      },
      {
        path: '/dashboard/embed',
        name: 'DashboardEmbed',
        component: DashboardView,
        props: (route) => ({
          isEmbed: true,
          hideHeader: route.query.hideHeader === 'true',
          hideMetrics: route.query.hideMetrics === 'true',
          hideCharts: route.query.hideCharts === 'true',
          hideFooter: route.query.hideFooter === 'true'
        })
      },
      {
        path: '/reports/at2',
        name: 'AT2Reports',
        component: AT2Reports
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Guardia de navegación para proteger rutas
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Verificar si la ruta requiere autenticación
  if (to.meta.requiresAuth !== false) {
    // Verificar autenticación de forma asíncrona
    const isAuthenticated = await authStore.checkAuth()

    if (!isAuthenticated) {
      // Redirigir a login si no está autenticado
      next({ name: 'Login' })
      return
    }
  }

  // Si está intentando acceder a login y ya está autenticado, redirigir al dashboard
  if (to.name === 'Login' && authStore.isAuthenticated) {
    next({ name: 'HomeDashboard' })
    return
  }

  next()
});

export default router;