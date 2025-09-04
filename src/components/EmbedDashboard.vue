<template>
  <div class="embed-dashboard">
    <!-- Header simple -->
    <div class="embed-header">
      <h1 class="embed-title">{{ title }}</h1>
      <p v-if="subtitle" class="embed-subtitle">{{ subtitle }}</p>
    </div>

    <!-- Contenido principal -->
    <div class="embed-content">
      <slot></slot>
    </div>

    <!-- Footer simple -->
    <div class="embed-footer">
      <span class="footer-text">{{ footerText }}</span>
      <span class="footer-timestamp">
        {{ formatDate(new Date()) }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface EmbedProps {
  title?: string;
  subtitle?: string;
  footerText?: string;
}

const props = withDefaults(defineProps<EmbedProps>(), {
  title: 'Dashboard SESAL',
  subtitle: 'Sistema de información',
  footerText: 'Dashboard SESAL'
});

// Función de utilidad para formatear fecha
const formatDate = (date: Date): string => {
  return date.toLocaleString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
</script>

<style scoped>
.embed-dashboard {
  @apply bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  min-height: 500px;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

.embed-header {
  @apply p-6 border-b border-gray-200;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.embed-title {
  @apply text-2xl font-semibold mb-2;
  margin: 0;
}

.embed-subtitle {
  @apply text-base opacity-90;
  margin: 0;
}

.embed-content {
  @apply p-6 flex-1;
  min-height: 300px;
  flex: 1;
  width: 100%;
}

.embed-footer {
  @apply p-4 text-sm bg-gray-50 border-t border-gray-200;
  @apply flex items-center justify-between;
  margin-top: auto;
}

.footer-text {
  @apply font-medium;
}

.footer-timestamp {
  @apply opacity-75;
}

/* Responsive */
@media (max-width: 1024px) {
  .embed-dashboard {
    max-width: 95%;
    margin: 0 2.5%;
  }

  .embed-header {
    @apply p-4;
  }

  .embed-content {
    @apply p-4;
  }

  .embed-footer {
    @apply p-3;
  }
}

@media (max-width: 768px) {
  .embed-dashboard {
    @apply text-sm;
    max-width: 98%;
    margin: 0 1%;
  }

  .embed-title {
    @apply text-lg;
  }

  .embed-content {
    @apply p-3;
  }
}

@media (max-width: 480px) {
  .embed-dashboard {
    max-width: 100%;
    margin: 0;
    border-radius: 0;
  }

  .embed-header {
    @apply p-3;
  }

  .embed-content {
    @apply p-3;
  }

  .embed-footer {
    @apply p-2;
  }
}
</style>

