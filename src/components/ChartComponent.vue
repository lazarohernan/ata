<template>
  <div class="w-full h-full relative">
    <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-lg z-10">
              <div class="flex items-center space-x-3">
          <div class="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
          <span class="text-gray-600 font-medium">Cargando gráfico...</span>
        </div>
    </div>

    <div v-else-if="error" class="absolute inset-0 flex items-center justify-center bg-red-50 rounded-lg z-10">
      <div class="text-center p-6">
        <div class="bg-red-100 rounded-full p-3 inline-block mb-4">
          <ExclamationTriangleIcon class="h-8 w-8 text-red-600" />
        </div>
        <h3 class="text-lg font-semibold text-red-900 mb-2">Error en el Gráfico</h3>
        <p class="text-red-700 text-sm">{{ error }}</p>
        <button
          @click="retryChart"
          class="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    </div>

    <canvas ref="chartCanvas" class="w-full h-full"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  BarController,
  LineController,
  PieController,
  DoughnutController
} from 'chart.js';
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline';

// Register Chart.js components globally
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  BarController,
  LineController,
  PieController,
  DoughnutController
);

interface ChartProps {
  chart: {
    id: string;
    title: string;
    type: 'bar' | 'line' | 'pie' | 'doughnut' | 'area';
    data: any;
    options: any;
  };
}

const props = defineProps<ChartProps>();

const chartCanvas = ref<HTMLCanvasElement | null>(null);
let chartInstance: ChartJS | null = null;

const loading = ref(false);
const error = ref<string | null>(null);

const createChart = async () => {
  if (!chartCanvas.value) return;

  loading.value = true;
  error.value = null;

  try {
    // Destroy existing chart if it exists
    if (chartInstance) {
      chartInstance.destroy();
    }

    const ctx = chartCanvas.value.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    // Validate chart data
    if (!props.chart.data) {
      throw new Error('No chart data available');
    }

    // Ensure data has proper structure
    if (!props.chart.data.datasets || props.chart.data.datasets.length === 0) {
      throw new Error('No datasets available in chart data');
    }

    // Ensure datasets have required properties
    props.chart.data.datasets.forEach((dataset: any, index: number) => {
      if (!dataset.data) {
        throw new Error(`Dataset ${index} has no data`);
      }
      if (dataset.data.length === 0) {
        throw new Error(`Dataset ${index} has empty data`);
      }
    });

    // Ensure labels exist
    if (!props.chart.data.labels || props.chart.data.labels.length === 0) {
      throw new Error('No labels available in chart data');
    }

    // Map chart types to Chart.js types
    let chartType: 'bar' | 'line' | 'pie' | 'doughnut' = 'bar';

    switch (props.chart.type) {
      case 'bar':
        chartType = 'bar';
        break;
      case 'line':
        chartType = 'line';
        break;
      case 'area':
        chartType = 'line';
        // Add fill property for area charts
        if (props.chart.data.datasets) {
          props.chart.data.datasets.forEach((dataset: any) => {
            dataset.fill = true;
          });
        }
        break;
      case 'pie':
        chartType = 'pie';
        break;
      case 'doughnut':
        chartType = 'doughnut';
        break;
      default:
        chartType = 'bar';
    }

    chartInstance = new ChartJS(ctx, {
      type: chartType,
      data: props.chart.data,
      options: {
        ...props.chart.options,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          ...props.chart.options?.plugins,
          legend: {
            ...props.chart.options?.plugins?.legend,
            display: true,
            position: 'top' as const,
          }
        }
      }
    });

  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error occurred';
    console.error('Chart creation error:', err);
  } finally {
    loading.value = false;
  }
};

const retryChart = () => {
  createChart();
};

onMounted(() => {
  createChart();
});

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy();
  }
});

// Watch for changes in chart data
watch(() => props.chart, () => {
  createChart();
}, { deep: true });
</script>