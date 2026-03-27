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

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api', onboardingRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/order-types', orderTypesRoutes);
app.use('/api/orders', ordersRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'MONTIO API is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 MONTIO Backend running on http://localhost:${PORT}`);
});
