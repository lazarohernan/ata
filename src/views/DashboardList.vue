<template>
  <div class="px-4 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h1 class="text-2xl font-semibold text-gray-900">Dashboards</h1>
        <p class="mt-2 text-sm text-gray-700">
          Lista de todos tus dashboards incluyendo título, descripción y fecha de última actualización.
        </p>
      </div>

    </div>

    <!-- Dashboard Grid -->
    <div class="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="dashboard in dashboards"
        :key="dashboard.id"
        class="group relative bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        @click="$router.push(`/dashboard/${dashboard.id}`)"
      >
        <div class="p-6">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <ChartBarIcon class="h-8 w-8 text-blue-600" />
              </div>
              <div class="ml-4">
                <h3 class="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                  {{ dashboard.title }}
                </h3>
                <p class="text-sm text-gray-500">
                  {{ dashboard.description }}
                </p>
              </div>
            </div>
            <div class="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                @click.stop="editDashboard(dashboard)"
                class="p-1 text-gray-400 hover:text-gray-600"
              >
                <PencilIcon class="h-4 w-4" />
              </button>
              <button
                @click.stop="deleteDashboardConfirm(dashboard.id)"
                class="p-1 text-gray-400 hover:text-red-600"
              >
                <TrashIcon class="h-4 w-4" />
              </button>
            </div>
          </div>
          <div class="mt-4 flex items-center text-sm text-gray-500">
            <CalendarIcon class="h-4 w-4 mr-1" />
            Actualizado {{ formatDate(dashboard.updatedAt) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Create Dashboard Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex min-h-screen items-center justify-center p-4">
        <div class="fixed inset-0 bg-black bg-opacity-25" @click="showCreateModal = false"></div>
        <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Crear Nuevo Dashboard</h3>
          <form @submit.prevent="createDashboard">
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Título</label>
              <input
                v-model="newDashboard.title"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ingrese el título del dashboard"
              />
            </div>
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
              <textarea
                v-model="newDashboard.description"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ingrese la descripción del dashboard"
              ></textarea>
            </div>
            <div class="flex justify-end space-x-3">
              <button
                type="button"
                @click="showCreateModal = false"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Crear Dashboard
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useDashboardStore } from '../stores/dashboard';
import {
  PlusIcon,
  ChartBarIcon,
  CalendarIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/vue/24/outline';

const dashboardStore = useDashboardStore();
const { dashboards, addDashboard, deleteDashboard } = dashboardStore;

const showCreateModal = ref(false);
const newDashboard = ref({
  title: '',
  description: ''
});

const createDashboard = () => {
  if (newDashboard.value.title.trim()) {
    addDashboard({
      title: newDashboard.value.title,
      description: newDashboard.value.description,
      charts: [],
      filters: {}
    });
    newDashboard.value = { title: '', description: '' };
    showCreateModal.value = false;
  }
};

const editDashboard = (dashboard: any) => {
  // TODO: Implement edit functionality
  console.log('Edit dashboard:', dashboard);
};

const deleteDashboardConfirm = (id: string) => {
  if (confirm('Are you sure you want to delete this dashboard?')) {
    deleteDashboard(id);
  }
};

const formatDate = (date: Date) => {
  return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
    Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
    'day'
  );
};
</script>