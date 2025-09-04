<template>
  <div class="px-4 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h1 class="text-2xl font-semibold text-gray-900">Charts</h1>
        <p class="mt-2 text-sm text-gray-700">
          Manage your chart library and create new visualizations.
        </p>
      </div>
      <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
        <button
          @click="$router.push('/charts/new')"
          class="inline-flex items-center justify-center rounded-lg border border-transparent bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform hover:scale-105 transition-all duration-200"
        >
          <PlusIcon class="h-5 w-5 mr-2" />
          Create New Chart
        </button>
      </div>
    </div>

    <!-- Charts Grid -->
    <div class="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <div
        v-for="chart in charts"
        :key="chart.id"
        class="group relative bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
      >
        <!-- Colorful gradient top bar -->
        <div
          :class="getGradientClass(chart.type)"
          class="h-2 w-full"
        ></div>

        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div :class="getIconBgClass(chart.type)" class="p-2 rounded-lg">
                  <component :is="getChartIcon(chart.type)" class="h-6 w-6 text-white" />
                </div>
              </div>
              <div class="ml-3 flex-1">
                <h3 class="text-lg font-semibold text-gray-900 truncate">
                  {{ chart.title }}
                </h3>
                <div class="flex items-center mt-1">
                  <span :class="getBadgeClass(chart.type)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                    {{ chart.type }} chart
                  </span>
                </div>
              </div>
            </div>
            <div class="flex space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-1 group-hover:translate-y-0">
              <button
                @click="editChart(chart.id)"
                class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                title="Edit chart"
              >
                <PencilIcon class="h-4 w-4" />
              </button>
              <button
                @click="deleteChartConfirm(chart.id)"
                class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                title="Delete chart"
              >
                <TrashIcon class="h-4 w-4" />
              </button>
              <button
                @click="embedChart(chart)"
                class="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200"
                title="Get embed code"
              >
                <CodeBracketIcon class="h-4 w-4" />
              </button>
            </div>
          </div>

          <!-- Enhanced Chart Preview -->
          <div class="relative h-32 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>
            <component :is="getChartIcon(chart.type)" class="h-16 w-16 text-gray-300 relative z-10" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
          </div>

          <div class="mt-4 flex items-center justify-between">
            <div class="text-sm text-gray-500">
              <span class="font-medium">Data source:</span> {{ getDataSourceName(chart.dataSource) }}
            </div>
            <div class="text-xs text-gray-400">
              {{ formatDate(chart.createdAt) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Embed Modal -->
    <div v-if="showEmbedModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex min-h-screen items-center justify-center p-4">
        <div class="fixed inset-0 bg-black bg-opacity-25" @click="showEmbedModal = false"></div>
        <div class="relative bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Embed Chart</h3>
          <p class="text-sm text-gray-600 mb-4">
            Copy the code below to embed this chart in your website:
          </p>
          <div class="bg-gray-100 rounded-md p-4 mb-4">
            <code class="text-sm text-gray-800 whitespace-pre-wrap">{{ embedCode }}</code>
          </div>
          <div class="flex justify-end space-x-3">
            <button
              @click="copyEmbedCode"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Copy Code
            </button>
            <button
              @click="showEmbedModal = false"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useDashboardStore } from '../stores/dashboard';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CodeBracketIcon,
  ChartBarIcon,
  ChartPieIcon,
  ArrowTrendingUpIcon
} from '@heroicons/vue/24/outline';

const router = useRouter();
const dashboardStore = useDashboardStore();
const { charts, dataSources, deleteChart } = dashboardStore;

const showEmbedModal = ref(false);
const selectedChart = ref(null);

const embedCode = computed(() => {
  if (!selectedChart.value) return '';
  return `<iframe 
  src="${window.location.origin}/embed/chart/${selectedChart.value.id}" 
  width="600" 
  height="400" 
  frameborder="0">
</iframe>`;
});

const getChartIcon = (type: string) => {
  const icons = {
    bar: ChartBarIcon,
    line: ArrowTrendingUpIcon,
    pie: ChartPieIcon,
    doughnut: ChartPieIcon,
    area: ArrowTrendingUpIcon
  };
  return icons[type] || ChartBarIcon;
};

const getGradientClass = (type: string) => {
  const gradients = {
    bar: 'bg-gradient-to-r from-blue-500 to-blue-600',
    line: 'bg-gradient-to-r from-green-500 to-green-600',
    pie: 'bg-gradient-to-r from-purple-500 to-purple-600',
    doughnut: 'bg-gradient-to-r from-pink-500 to-pink-600',
    area: 'bg-gradient-to-r from-indigo-500 to-indigo-600'
  };
  return gradients[type] || 'bg-gradient-to-r from-gray-500 to-gray-600';
};

const getIconBgClass = (type: string) => {
  const backgrounds = {
    bar: 'bg-blue-500',
    line: 'bg-green-500',
    pie: 'bg-purple-500',
    doughnut: 'bg-pink-500',
    area: 'bg-indigo-500'
  };
  return backgrounds[type] || 'bg-gray-500';
};

const getBadgeClass = (type: string) => {
  const badges = {
    bar: 'bg-blue-100 text-blue-800',
    line: 'bg-green-100 text-green-800',
    pie: 'bg-purple-100 text-purple-800',
    doughnut: 'bg-pink-100 text-pink-800',
    area: 'bg-indigo-100 text-indigo-800'
  };
  return badges[type] || 'bg-gray-100 text-gray-800';
};

const getDataSourceName = (dataSourceId: string) => {
  const dataSource = dataSources.find(ds => ds.id === dataSourceId);
  return dataSource ? dataSource.name : 'Unknown';
};

const formatDate = (date: string | Date) => {
  if (!date) return 'Recently';
  const d = new Date(date);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - d.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return 'Today';
  if (diffDays === 2) return 'Yesterday';
  if (diffDays < 7) return `${diffDays - 1} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
};

const editChart = (chartId: string) => {
  // Navigate to chart editor
  router.push(`/charts/${chartId}/edit`);
};

const deleteChartConfirm = (chartId: string) => {
  if (confirm('Are you sure you want to delete this chart?')) {
    deleteChart(chartId);
  }
};

const embedChart = (chart: any) => {
  selectedChart.value = chart;
  showEmbedModal.value = true;
};

const copyEmbedCode = async () => {
  try {
    await navigator.clipboard.writeText(embedCode.value);
    alert('Embed code copied to clipboard!');
  } catch (err) {
    console.error('Failed to copy embed code:', err);
  }
};
</script>