import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import userRouter from './routes/userRoute.js';
import productRouter from './routes/productRoute.js';
import cartRouter from './routes/cartRoute.js';
import orderRouter from './routes/orderRoute.js';
import wishlistRouter from './routes/wishlistRoute.js';
import { cache } from './middleware/cache.js';
import { invalidateProductCache } from './middleware/cache.js';

// App Config
const app = express();
const port = process.env.PORT || 4000;

// Initialize database and cloud services
connectDB();
connectCloudinary();

// CORS Configuration
const allowedOrigins = [
  'https://yaazhi-ecommerce.netlify.app',
  'http://localhost:5173' // Keep local development URL
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(express.json());
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));

// Add cache to app locals for use in routes
app.locals.cache = cache;

// Log cache stats on startup
console.log('Cache initialized with the following stats:');
console.log(cache.getStats());

// Health check endpoint
app.get('/health', (req, res) => {
  const healthcheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now()
  };
  res.status(200).json(healthcheck);
});

// API Endpoints
app.use('/api/user', userRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/order', orderRouter);
app.use('/api/wishlist', wishlistRouter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'E-commerce API is running',
    documentation: 'API documentation available at /api-docs',
    timestamp: new Date().toISOString()
  });
});

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  
  // Invalidate product cache on error for write operations
  if (req.method !== 'GET') {
    invalidateProductCache();
  }
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

app.listen(port, ()=> console.log('Server started on PORT : '+ port))