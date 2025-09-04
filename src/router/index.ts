import { createRouter, createWebHistory } from 'vue-router';
import DashboardList from '../views/DashboardList.vue';
import DataSources from '../views/DataSources.vue';
import DashboardView from '../views/DashboardView.vue';
import AT2Reports from '../views/AT2Reports.vue';


const routes = [
  {
    path: '/',
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
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;