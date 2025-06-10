import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './src/routes/auth.js';
import bookingsRoutes from './src/routes/bookings.js';
import { setupDB } from './src/db/setup.js';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({
  origin: [
    'http://172.105.122.88:3000',  // Production frontend
    'http://localhost:3000',       // Local development
    'http://localhost:3002'        // Alternative local dev port
  ],
  credentials: true, // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingsRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('Lodging API is running');
});

await setupDB()
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;

