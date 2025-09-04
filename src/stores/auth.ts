import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface User {
  username: string
  name: string
  role: 'admin' | 'user'
  remember: boolean
}

export const useAuthStore = defineStore('auth', () => {
  // Estado
  const user = ref<User | null>(null)
  const isAuthenticated = ref(false)

  // Getters
  const isAdmin = computed(() => user.value?.role === 'admin')
  const userName = computed(() => user.value?.name || '')
  const userRole = computed(() => user.value?.role || '')

  // Acciones
  const login = (userData: User) => {
    user.value = userData
    isAuthenticated.value = true

    // Guardar en localStorage si se marcó "recordar"
    if (userData.remember) {
      localStorage.setItem('auth_user', JSON.stringify(userData))
    } else {
      sessionStorage.setItem('auth_user', JSON.stringify(userData))
    }
  }

  const logout = () => {
    user.value = null
    isAuthenticated.value = false
    localStorage.removeItem('auth_user')
    localStorage.removeItem('auth_token')
    sessionStorage.removeItem('auth_user')
    sessionStorage.removeItem('auth_token')
  }

  const checkAuth = async () => {
    // Verificar si hay datos de autenticación guardados
    const storedUser = localStorage.getItem('auth_user') || sessionStorage.getItem('auth_user')
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')

    if (storedUser && token) {
      try {
        const userData = JSON.parse(storedUser)

        // Verificar token con la API
        const response = await fetch('http://localhost:3000/api/auth/verify', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            user.value = userData
            isAuthenticated.value = true
            return true
          }
        }

        // Si la verificación falla, limpiar datos
        logout()
        return false
      } catch {
        // Si hay error al verificar, limpiar storage
        logout()
        return false
      }
    }
    return false
  }

  return {
    // Estado
    user,
    isAuthenticated,

    // Getters
    isAdmin,
    userName,
    userRole,

    // Acciones
    login,
    logout,
    checkAuth
  }
})
