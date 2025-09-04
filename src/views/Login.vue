<template>
  <div class="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-emerald-50 flex items-start justify-center px-4 pt-16">
    <div class="max-w-md w-full">
      <!-- Logo y título -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-sky-600 rounded-full mb-4">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
          </svg>
        </div>
        <h1 class="text-3xl font-bold text-gray-900">Sistema AT2</h1>
        <p class="text-gray-600 mt-2">Sistema de Reportes</p>
        <p class="text-sm text-gray-500 mt-1">Secretaría de Salud de Honduras</p>
      </div>

      <!-- Formulario de login -->
      <div class="bg-white rounded-2xl shadow-xl p-8">
        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- Usuario -->
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700 mb-2">
              Usuario
            </label>
            <input
              id="username"
              v-model="form.username"
              type="text"
              required
              placeholder="Ingrese su usuario"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors duration-200"
              :class="{ 'border-red-300 focus:ring-red-500': errors.username }"
            />
            <p v-if="errors.username" class="mt-1 text-sm text-red-600">
              {{ errors.username }}
            </p>
          </div>

          <!-- Contraseña -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              required
              placeholder="Ingrese su contraseña"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors duration-200"
              :class="{ 'border-red-300 focus:ring-red-500': errors.password }"
            />
            <p v-if="errors.password" class="mt-1 text-sm text-red-600">
              {{ errors.password }}
            </p>
          </div>

          <!-- Recordar sesión -->
          <div class="flex items-center">
            <input
              id="remember"
              v-model="form.remember"
              type="checkbox"
              class="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
            />
            <label for="remember" class="ml-2 block text-sm text-gray-700">
              Recordar mi sesión
            </label>
          </div>

          <!-- Mensaje de error general -->
          <div v-if="loginError" class="bg-red-50 border border-red-200 rounded-lg p-3">
            <p class="text-sm text-red-600">{{ loginError }}</p>
          </div>

          <!-- Botón de login -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-sky-600 text-white py-3 px-4 rounded-lg hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <svg v-if="loading" class="animate-spin h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            <span v-else>🚪 Iniciar Sesión</span>
          </button>
        </form>

        <!-- Información adicional -->
        <div class="mt-6 text-center">
          <p class="text-xs text-gray-500">
            Sistema de Reportes
          </p>
          <p class="text-xs text-gray-400 mt-1">
            SESAL - Honduras
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.ts'
import api from '../services/api.ts'

const router = useRouter()
const authStore = useAuthStore()

// Estado del formulario
const form = reactive({
  username: '',
  password: '',
  remember: false
})

// Estados de validación
const errors = reactive({
  username: '',
  password: ''
})

// Estados de UI
const loading = ref(false)
const loginError = ref('')

// Función de login
const handleLogin = async () => {
  // Limpiar errores previos
  loginError.value = ''
  errors.username = ''
  errors.password = ''

  // Validación básica
  if (!form.username.trim()) {
    errors.username = 'El usuario es requerido'
    return
  }

  if (!form.password.trim()) {
    errors.password = 'La contraseña es requerida'
    return
  }

  loading.value = true

  try {
    // Llamada a la API de autenticación usando el servicio configurado
    const response = await api.post('/auth/login', {
      username: form.username,
      password: form.password
    })

    const data = response.data

    if (!data.success) {
      throw new Error(data.message || 'Error en la autenticación')
    }

    if (data.success) {
      // Login exitoso - guardar token y datos del usuario
      const { user, token } = data.data

      // Guardar token en localStorage o sessionStorage según la preferencia del usuario
      if (form.remember) {
        localStorage.setItem('auth_token', token)
      } else {
        sessionStorage.setItem('auth_token', token)
      }

      // Actualizar store de autenticación
      authStore.login({
        username: user.username,
        name: user.name,
        role: user.role,
        remember: form.remember
      })

      // Redirigir al dashboard
      router.push('/')
    } else {
      throw new Error(data.message || 'Error en la autenticación')
    }
  } catch (error: any) {
    loginError.value = error.message || 'Error al iniciar sesión. Intente nuevamente.'
  } finally {
    loading.value = false
  }
}
</script>
