<template>
  <div class="embed-example">
    <EmbedDashboard
      title="Sistema ATA - Dashboard"
      subtitle="Vista simplificada de datos"
      footer-text="Sistema de información ATA"
    >
      <!-- Aquí puedes agregar cualquier contenido personalizado -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <!-- Métrica simple -->
        <div class="bg-blue-50 p-6 rounded-lg border border-blue-200 hover:shadow-md transition-shadow">
          <h3 class="text-lg font-semibold text-blue-900 mb-3">Total Registros</h3>
          <p class="text-3xl font-bold text-blue-600 mb-2">16.7M</p>
          <p class="text-sm text-blue-700">Datos históricos completos</p>
        </div>

        <!-- Métrica simple -->
        <div class="bg-green-50 p-6 rounded-lg border border-green-200 hover:shadow-md transition-shadow">
          <h3 class="text-lg font-semibold text-green-900 mb-3">Registros 2024</h3>
          <p class="text-3xl font-bold text-green-600 mb-2">1.09M</p>
          <p class="text-sm text-green-700">Datos detallados del año</p>
        </div>

        <!-- Métrica simple -->
        <div class="bg-purple-50 p-6 rounded-lg border border-purple-200 hover:shadow-md transition-shadow">
          <h3 class="text-lg font-semibold text-purple-900 mb-3">Años de Datos</h3>
          <p class="text-3xl font-bold text-purple-600 mb-2">18</p>
          <p class="text-sm text-purple-700">2008 - 2025</p>
        </div>

        <!-- Métrica simple -->
        <div class="bg-orange-50 p-6 rounded-lg border border-orange-200 hover:shadow-md transition-shadow">
          <h3 class="text-lg font-semibold text-orange-900 mb-3">Datos Básicos</h3>
          <p class="text-3xl font-bold text-orange-600 mb-2">333K</p>
          <p class="text-sm text-orange-700">Registros históricos</p>
        </div>
      </div>

      <!-- Espacio para gráficos -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div class="bg-gray-50 p-6 rounded-lg border">
          <h3 class="text-xl font-semibold mb-4">Gráfico Mensual 2024</h3>
          <div class="h-80 bg-white rounded border flex items-center justify-center">
            <p class="text-gray-500 text-lg">Aquí iría tu gráfico de barras mensuales</p>
          </div>
        </div>

        <div class="bg-gray-50 p-6 rounded-lg border">
          <h3 class="text-xl font-semibold mb-4">Comparación Anual</h3>
          <div class="h-80 bg-white rounded border flex items-center justify-center">
            <p class="text-gray-500 text-lg">Aquí iría tu gráfico de líneas anuales</p>
          </div>
        </div>
      </div>

      <!-- Tabla amplia -->
      <div class="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 class="text-xl font-semibold mb-4">Datos Recientes - Vista Completa</h3>
        <div class="overflow-x-auto">
          <table class="min-w-full table-auto">
            <thead class="bg-gray-50">
              <tr>
                <th class="text-left py-3 px-4 font-semibold text-gray-900 border-b">Fecha</th>
                <th class="text-left py-3 px-4 font-semibold text-gray-900 border-b">Tipo de Registro</th>
                <th class="text-left py-3 px-4 font-semibold text-gray-900 border-b">Categoría</th>
                <th class="text-left py-3 px-4 font-semibold text-gray-900 border-b">Valor</th>
                <th class="text-left py-3 px-4 font-semibold text-gray-900 border-b">Estado</th>
                <th class="text-left py-3 px-4 font-semibold text-gray-900 border-b">Responsable</th>
              </tr>
            </thead>
            <tbody>
              <tr class="border-b hover:bg-gray-50">
                <td class="py-3 px-4">2024-01-15</td>
                <td class="py-3 px-4">Registro Completo</td>
                <td class="py-3 px-4">Datos Históricos</td>
                <td class="py-3 px-4 font-semibold">1,234</td>
                <td class="py-3 px-4">
                  <span class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Activo</span>
                </td>
                <td class="py-3 px-4">Sistema ATA</td>
              </tr>
              <tr class="border-b hover:bg-gray-50">
                <td class="py-3 px-4">2024-01-14</td>
                <td class="py-3 px-4">Actualización</td>
                <td class="py-3 px-4">Datos Detallados</td>
                <td class="py-3 px-4 font-semibold">987</td>
                <td class="py-3 px-4">
                  <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">En Proceso</span>
                </td>
                <td class="py-3 px-4">Usuario Admin</td>
              </tr>
              <tr class="border-b hover:bg-gray-50">
                <td class="py-3 px-4">2024-01-13</td>
                <td class="py-3 px-4">Nuevo Registro</td>
                <td class="py-3 px-4">Datos Básicos</td>
                <td class="py-3 px-4 font-semibold">2,345</td>
                <td class="py-3 px-4">
                  <span class="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">Completado</span>
                </td>
                <td class="py-3 px-4">Sistema Automático</td>
              </tr>
              <tr class="border-b hover:bg-gray-50">
                <td class="py-3 px-4">2024-01-12</td>
                <td class="py-3 px-4">Verificación</td>
                <td class="py-3 px-4">Control de Calidad</td>
                <td class="py-3 px-4 font-semibold">1,567</td>
                <td class="py-3 px-4">
                  <span class="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Pendiente</span>
                </td>
                <td class="py-3 px-4">Equipo de QA</td>
              </tr>
              <tr class="hover:bg-gray-50">
                <td class="py-3 px-4">2024-01-11</td>
                <td class="py-3 px-4">Backup</td>
                <td class="py-3 px-4">Mantenimiento</td>
                <td class="py-3 px-4 font-semibold">8,901</td>
                <td class="py-3 px-4">
                  <span class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Exitoso</span>
                </td>
                <td class="py-3 px-4">Sistema Backup</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </EmbedDashboard>
  </div>
</template>

<script setup lang="ts">
import EmbedDashboard from '@/components/EmbedDashboard.vue';
</script>

<style scoped>
.embed-example {
  @apply p-4;
  min-height: 100vh;
  background-color: #f8fafc;
}
</style>
