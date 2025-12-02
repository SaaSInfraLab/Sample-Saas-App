const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const healthRoutes = require('./routes/health');
const tenantRoutes = require('./routes/tenant');

// Import metrics
const metricsMiddleware = require('./metrics/prometheus');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Prometheus metrics
if (process.env.METRICS_ENABLED === 'true') {
  app.use(metricsMiddleware);
}

app.use('/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/tenant', tenantRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'Task Management Sample App API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      metrics: '/metrics',
      auth: '/api/auth',
      tasks: '/api/tasks',
      tenant: '/api/tenant',
    },
  });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Metrics enabled: ${process.env.METRICS_ENABLED || 'false'}`);
});

module.exports = app;

