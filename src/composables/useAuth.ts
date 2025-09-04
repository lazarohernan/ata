import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

export const useAuth = () => {
  const router = useRouter()
  const authStore = useAuthStore()

  const isLoading = ref(true)

  const requireAuth = async () => {
    isLoading.value = true

    try {
      // Verificar autenticación
      authStore.checkAuth()

      if (!authStore.isAuthenticated) {
        router.push('/login')
        return false
      }

      return true
    } finally {
      isLoading.value = false
    }
  }

  const requireAdmin = async () => {
    const isAuthenticated = await requireAuth()

    if (!isAuthenticated) return false

    if (!authStore.isAdmin) {
      // Redirigir a dashboard si no es admin
      router.push('/')
      return false
    }

    return true
  }

  const logout = () => {
    authStore.logout()
    router.push('/login')
  }

  return {
    requireAuth,
    requireAdmin,
    logout,
    isLoading
  }
}
