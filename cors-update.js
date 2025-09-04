// Actualizar configuración CORS para permitir localhost:5174
const express = require('express');
const cors = require('cors');
const { testConnection, executeQuery, getCacheStats } = require('./mysql-config');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración basada en entorno
const isProduction = process.env.NODE_ENV === 'production';

// Middleware con CORS actualizado
app.use(cors({
  origin: isProduction ? 
    ['http://3.141.99.154:4000', 'http://3.141.99.154', 'http://localhost:5174', 'http://localhost:5175'] : 
    ['http://localhost:4000', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
