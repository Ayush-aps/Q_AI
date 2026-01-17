import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { clerkMiddleware,requireAuth } from '@clerk/express'
import aiRouter from './routes/aiRoutes.js';
import connectCloudinary from './configs/cloudinary.js';
import userRouter from './routes/userRoutes.js';
import testRouter from './routes/testRoutes.js';
import webhookRouter from './routes/webhookRoutes.js';
import { auth } from './middlewares/auth.js';

const app = express();
 await connectCloudinary();

// Optimize CORS
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));

// ⚠️ IMPORTANT: Webhook route MUST come BEFORE express.json()
// Otherwise express.json() will try to parse the raw webhook body and fail
app.use('/api/webhooks', webhookRouter);

// Now apply JSON parser for all other routes
app.use(express.json());

// Add performance headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  next();
});

app.use(clerkMiddleware())

app.get('/', (req, res) => {
  res.send('Hello from QuickAI server!');
});
 app.use(requireAuth())
 app.use('/api/test', auth, testRouter)
 app.use('/api/ai',aiRouter)
 app.use('/api/user' , userRouter)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    });