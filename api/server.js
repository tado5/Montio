import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import companiesRoutes from './routes/companies.js';
import onboardingRoutes from './routes/onboarding.js';
import dashboardRoutes from './routes/dashboard.js';
import orderTypesRoutes from './routes/orderTypes.js';
import ordersRoutes from './routes/orders.js';
import employeesRoutes from './routes/employees.js';
import jobPositionsRoutes from './routes/jobPositions.js';
import notificationsRoutes from './routes/notifications.js';
import settingsRoutes from './routes/settings.js';
import { CORS_CONFIG } from './config/constants.js';
import { errorMiddleware } from './utils/errorHandler.js';

// Load environment variables FIRST
dotenv.config();

// Validate critical environment variables
const requiredEnvVars = ['JWT_SECRET', 'DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
  console.error('Please create .env file with required variables');
  process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
// CORS configuration for security
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, postman)
    if (!origin) return callback(null, true);

    // In development, allow localhost
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }

    // In production, check whitelist
    const allowedOrigins = CORS_CONFIG.ALLOWED_ORIGINS;
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: CORS_CONFIG.CREDENTIALS,
  methods: CORS_CONFIG.METHODS,
  allowedHeaders: CORS_CONFIG.ALLOWED_HEADERS
}));

app.use(express.json({ limit: '10mb' })); // Body size limit

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api', onboardingRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/order-types', orderTypesRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/employees', employeesRoutes);
app.use('/api/job-positions', jobPositionsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/company', settingsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'MONTIO API is running',
    version: '1.10.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// Global error handling middleware (must be last)
app.use(errorMiddleware);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 MONTIO Backend running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  Database: ${process.env.DB_HOST}`);
});
