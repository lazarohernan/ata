<template>
  <div v-if="isVisible" class="fixed inset-0 z-50 overflow-y-auto">
    <!-- Overlay de fondo -->
    <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" @click="closeModal"></div>
    
    <!-- Modal -->
    <div class="flex min-h-full items-center justify-center p-4">
      <div class="relative w-full max-w-2xl bg-white rounded-lg shadow-xl">
        <!-- Header del modal -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <div class="flex items-center space-x-3">
            <div class="p-2 bg-blue-100 rounded-lg">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 1.79 4 4 4h8c2.21 0 4-1.79 4-4V7M4 7V5c0-1.1.9-2 2-2h12c0 1.1.9 2 2 2v2M4 7h16" />
              </svg>
            </div>
            <div>
              <h3 class="text-xl font-semibold text-gray-900">
                {{ isEditing ? 'Editar' : 'Agregar' }} Fuente MySQL
              </h3>
              <p class="text-sm text-gray-500 mt-1">
                {{ isEditing ? 'Modifica la configuración de la fuente de datos' : 'Configura una nueva conexión MySQL' }}
              </p>
            </div>
          </div>
          <button
            @click="closeModal"
            class="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Formulario Simplificado -->
        <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
          <!-- Nombre de la fuente -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Nombre de la Fuente <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.name"
              type="text"
              required
              placeholder="Ej: Base de Datos SESAL Histórica"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors duration-200"
              :class="{ 'border-red-300 focus:ring-red-500': errors.name }"
            />
            <p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name }}</p>
          </div>

          <!-- Configuración Rápida -->
          <div class="bg-sky-50 border border-sky-200 rounded-lg p-4 mb-6">
            <div class="flex items-center justify-between mb-3">
              <h4 class="text-sm font-medium text-sky-900">⚡ Configuración Rápida</h4>
              <button
                type="button"
                @click="fillAWSCredentials"
                class="text-xs bg-sky-600 text-white px-3 py-1 rounded hover:bg-sky-700 transition-colors"
              >
                Usar AWS MySQL
              </button>
            </div>
            <p class="text-xs text-sky-700">
              Haz clic para llenar automáticamente los datos de la base de datos en AWS Lightsail.
            </p>
          </div>

          <!-- Host -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Host <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.host"
                type="text"
                required
                placeholder="Ej: 18.116.12.40 o localhost"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                :class="{ 'border-red-300 focus:ring-red-500': errors.host }"
              />
              <p v-if="errors.host" class="mt-1 text-sm text-red-600">{{ errors.host }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Puerto <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.port"
                type="number"
                required
                placeholder="3306"
                min="1"
                max="65535"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                :class="{ 'border-red-300 focus:ring-red-500': errors.port }"
              />
              <p v-if="errors.port" class="mt-1 text-sm text-red-600">{{ errors.port }}</p>
            </div>
          </div>

          <!-- Base de datos y usuario -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la Base de Datos <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.database"
                type="text"
                required
                placeholder="sesal_historico"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                :class="{ 'border-red-300 focus:ring-red-500': errors.database }"
              />
              <p v-if="errors.database" class="mt-1 text-sm text-red-600">{{ errors.database }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Usuario <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.username"
                type="text"
                required
                placeholder="vuebi_user"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                :class="{ 'border-red-300 focus:ring-red-500': errors.username }"
              />
              <p v-if="errors.username" class="mt-1 text-sm text-red-600">{{ errors.username }}</p>
            </div>
          </div>

          <!-- Contraseña -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Contraseña <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                required
                placeholder="Ingresa la contraseña"
                class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                :class="{ 'border-red-300 focus:ring-red-500': errors.password }"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
              >
                <svg v-if="showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
            <p v-if="errors.password" class="mt-1 text-sm text-red-600">{{ errors.password }}</p>
          </div>


          <!-- Botones de acción -->
          <div class="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              @click="closeModal"
              class="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
            >
              Cancelar
            </button>
            <button
              type="button"
              @click="testConnection"
              :disabled="testingConnection || !isFormValid"
              class="px-6 py-3 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <svg v-if="testingConnection" class="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ testingConnection ? 'Probando...' : 'Probar Conexión' }}
            </button>
            <button
              type="submit"
              :disabled="!isFormValid || testingConnection"
              class="px-6 py-3 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {{ isEditing ? 'Actualizar' : 'Crear' }} Fuente de Datos
            </button>
          </div>
        </form>

        <!-- Resultado del test de conexión -->
        <div v-if="connectionTestResult" class="px-6 pb-6">
          <div
            :class="[
              'p-4 rounded-lg border',
              connectionTestResult.success
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
            ]"
          >
            <div class="flex items-center space-x-2">
              <svg
                v-if="connectionTestResult.success"
                class="w-5 h-5 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <svg
                v-else
                class="w-5 h-5 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span class="font-medium">
                {{ connectionTestResult.success ? 'Conexión Exitosa' : 'Error de Conexión' }}
              </span>
            </div>
            <p class="mt-2 text-sm">{{ connectionTestResult.message }}</p>
            <div v-if="connectionTestResult.details" class="mt-2 text-xs opacity-75">
              {{ connectionTestResult.details }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, reactive, onMounted } from 'vue';
import { useDashboardStore } from '../stores/dashboard';
import { apiService } from '../services/api';

interface DataSource {
  id: string;
  name: string;
  type: 'mysql' | 'postgresql' | 'sqlite' | 'sqlserver' | 'oracle';
  host: string;
  port: number;
  database: string;
  username: string;
  password?: string;
  status: 'connected' | 'disconnected' | 'testing';
  timeout?: number;
  useSSL?: boolean;
  poolSize?: number;
}

interface Props {
  isVisible: boolean;
  dataSource?: DataSource | null;
}

interface FormData {
  name: string;
  type: string;
  host: string;
  port: string;
  database: string;
  username: string;
  password: string;
  timeout: string;
  useSSL: boolean;
  poolSize: string;
}

interface DatabaseType {
  type: string;
  name: string;
  defaultPort: number | null;
  description: string;
}

interface FormErrors {
  name?: string;
  type?: string;
  host?: string;
  port?: string;
  database?: string;
  username?: string;
  password?: string;
}

interface ConnectionTestResult {
  success: boolean;
  message: string;
  details?: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  close: [];
  saved: [dataSource: DataSource];
}>();

const dashboardStore = useDashboardStore();

// Estado del formulario
const form = reactive<FormData>({
  name: '',
  type: 'mysql',
  host: '',
  port: '',
  database: '',
  username: '',
  password: '',
  timeout: '30',
  useSSL: false,
  poolSize: '5'
});

// Estado de validación
const errors = reactive<FormErrors>({});
const showPassword = ref(false);
const testingConnection = ref(false);
const connectionTestResult = ref<ConnectionTestResult | null>(null);

// Estado de tipos de base de datos
const databaseTypes = ref<DatabaseType[]>([]);
const selectedDatabaseType = computed(() => 
  databaseTypes.value.find(db => db.type === form.type)
);

// Computed properties
const isEditing = computed(() => !!props.dataSource);
const isFormValid = computed(() => {
  return form.name && form.type && form.host && form.port && form.database && form.username && form.password;
});

// Watchers
watch(() => props.isVisible, (visible) => {
  if (visible && props.dataSource) {
    // Modo edición - llenar formulario
    fillFormWithDataSource(props.dataSource);
  } else if (visible && !props.dataSource) {
    // Modo creación - resetear formulario
    resetForm();
  }
});

// Métodos de tipos de base de datos
const loadDatabaseTypes = async () => {
  try {
    const types = await apiService.getDatabaseTypes();
    databaseTypes.value = types;
  } catch (error) {
    console.error('Error loading database types:', error);
  }
};

const onTypeChange = () => {
  if (selectedDatabaseType.value && selectedDatabaseType.value.defaultPort && !form.port) {
    form.port = selectedDatabaseType.value.defaultPort.toString();
  }
};

// Función para llenar automáticamente las credenciales de AWS
const fillAWSCredentials = () => {
  form.type = 'mysql';
  // Backend y MySQL corren en la misma instancia → usar localhost
  form.host = 'localhost';
  form.port = '3306';
  form.database = 'sesal_historico';
  form.username = 'vuebi_user';
  form.password = 'VueBi2024SecurePass';
  form.timeout = '30';
  form.useSSL = false;
  form.poolSize = '5';
};

// Métodos
const fillFormWithDataSource = (dataSource: DataSource) => {
  if (!dataSource) return;

  form.name = dataSource.name || '';
  form.type = dataSource.type || '';
  form.host = dataSource.host || '';
  form.port = dataSource.port ? dataSource.port.toString() : '';
  form.database = dataSource.database || '';
  form.username = dataSource.username || '';
  form.password = dataSource.password || '';
  form.timeout = dataSource.timeout ? dataSource.timeout.toString() : '30';
  form.useSSL = dataSource.useSSL || false;
  form.poolSize = dataSource.poolSize ? dataSource.poolSize.toString() : '5';
};

const resetForm = () => {
  Object.assign(form, {
    name: '',
    type: 'mysql',
    host: '',
    port: '',
    database: '',
    username: '',
    password: '',
    timeout: '30',
    useSSL: false,
    poolSize: '5'
  });
  Object.assign(errors, {});
  connectionTestResult.value = null;
};

const validateForm = (): boolean => {
  Object.assign(errors, {});

  if (!form.name.trim()) {
    errors.name = 'El nombre es requerido';
  }

  if (!form.type) {
    errors.type = 'Debes seleccionar un tipo de base de datos';
  }

  if (!form.host.trim()) {
    errors.host = 'El host es requerido';
  }

  if (!form.port || isNaN(Number(form.port)) || Number(form.port) < 1 || Number(form.port) > 65535) {
    errors.port = 'El puerto debe ser un número entre 1 y 65535';
  }

  if (!form.database.trim()) {
    errors.database = 'El nombre de la base de datos es requerido';
  }

  if (!form.username.trim()) {
    errors.username = 'El usuario es requerido';
  }

  if (!form.password) {
    errors.password = 'La contraseña es requerida';
  }

  return Object.keys(errors).length === 0;
};

const testConnection = async () => {
  if (!validateForm()) return;

  testingConnection.value = true;
  connectionTestResult.value = null;

  try {
    const testResult = await dashboardStore.testDataSourceConnection({
      type: form.type as any,
      host: form.host,
      port: parseInt(form.port),
      database: form.database,
      username: form.username,
      password: form.password,
      timeout: parseInt(form.timeout),
      useSSL: form.useSSL,
      poolSize: parseInt(form.poolSize)
    });

    connectionTestResult.value = {
      success: testResult.success,
      message: testResult.success 
        ? 'La conexión se estableció correctamente. La fuente de datos está lista para usar.'
        : 'No se pudo establecer la conexión. Verifica los parámetros e intenta nuevamente.',
      details: testResult.message
    };
  } catch (error) {
    connectionTestResult.value = {
      success: false,
      message: 'Error al probar la conexión. Intenta nuevamente.',
      details: error instanceof Error ? error.message : 'Error desconocido'
    };
  } finally {
    testingConnection.value = false;
  }
};

const handleSubmit = async () => {
  if (!validateForm()) return;

  try {
    const dataSourceData = {
      name: form.name.trim(),
      type: form.type as any,
      host: form.host.trim(),
      port: parseInt(form.port),
      database: form.database.trim(),
      username: form.username.trim(),
      password: form.password,
      status: 'disconnected' as const,
      timeout: parseInt(form.timeout),
      useSSL: form.useSSL,
      poolSize: parseInt(form.poolSize)
    };

    let savedDataSource: DataSource;

    if (isEditing.value && props.dataSource) {
      // Actualizar fuente existente
      savedDataSource = await dashboardStore.updateDataSource(props.dataSource.id, dataSourceData);
    } else {
      // Crear nueva fuente
      savedDataSource = await dashboardStore.addDataSource(dataSourceData);
    }

    emit('saved', savedDataSource);
    closeModal();
  } catch (error) {
    console.error('Error saving data source:', error);
    // Aquí podrías mostrar un mensaje de error al usuario
  }
};

const closeModal = () => {
  emit('close');
  resetForm();
};

// Inicialización
onMounted(() => {
  loadDatabaseTypes();
});
</script>
