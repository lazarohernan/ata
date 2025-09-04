<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <!-- Navigation Header -->
    <nav class="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 shadow-lg border-b border-blue-500/30">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <div class="flex-shrink-0 flex items-center">
              <div class="bg-white/20 backdrop-blur-sm rounded-lg p-2 mr-3">
                <ChartBarIcon class="h-6 w-6 text-white" />
              </div>
              <span class="text-xl font-bold text-white">SESAL</span>
            </div>
            <div class="hidden sm:ml-8 sm:flex sm:space-x-1">
              <router-link
                to="/"
                class="relative px-4 py-2 text-sm font-medium text-blue-100 hover:text-white transition-all duration-200 rounded-md hover:bg-white/10 group"
                active-class="!text-white !bg-white/20"
              >
                <span class="relative z-10">Dashboard</span>
                <div class="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              </router-link>

              <router-link
                to="/reports/at2"
                class="relative px-4 py-2 text-sm font-medium text-blue-100 hover:text-white transition-all duration-200 rounded-md hover:bg-white/10 group"
                active-class="!text-white !bg-white/20"
              >
                <span class="relative z-10">Reportes AT2</span>
                <div class="absolute inset-0 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              </router-link>

              <router-link
                to="/data-sources"
                class="relative px-4 py-2 text-sm font-medium text-blue-100 hover:text-white transition-all duration-200 rounded-md hover:bg-white/10 group"
                active-class="!text-white !bg-white/20"
              >
                <span class="relative z-10">Fuentes de Datos</span>
                <div class="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              </router-link>

            </div>
          </div>
          <!-- Botones de notificación y configuración removidos temporalmente -->
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import {
  ChartBarIcon
} from '@heroicons/vue/24/outline';
</script>