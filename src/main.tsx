import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './router';
import App from './App.vue';
import './index.css';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

// Inicializar autenticación después de que Pinia esté listo
const authStore = (await import('./stores/auth')).useAuthStore();

app.mount('#root');
