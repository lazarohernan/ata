// Composable para debounce optimizado
export function useDebounce() {
  const timeouts = new Map()

  const debounce = (func, wait, key = 'default') => {
    return (...args) => {
      // Limpiar timeout anterior
      if (timeouts.has(key)) {
        clearTimeout(timeouts.get(key))
      }

      // Crear nuevo timeout
      const timeout = setTimeout(() => {
        func.apply(this, args)
        timeouts.delete(key)
      }, wait)

      timeouts.set(key, timeout)
    }
  }

  const cancel = (key = 'default') => {
    if (timeouts.has(key)) {
      clearTimeout(timeouts.get(key))
      timeouts.delete(key)
    }
  }

  const cancelAll = () => {
    timeouts.forEach((timeout) => clearTimeout(timeout))
    timeouts.clear()
  }

  // Limpiar todos los timeouts al desmontar
  const cleanup = () => {
    cancelAll()
  }

  return {
    debounce,
    cancel,
    cancelAll,
    cleanup
  }
}





