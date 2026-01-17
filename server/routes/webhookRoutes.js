import express from 'express';
import { clerkWebhook } from '../controllers/webhookController.js';

const webhookRouter = express.Router();

// Clerk webhook endpoint - use raw body parser to avoid JSON parse errors
webhookRouter.post('/clerk', express.raw({ type: 'application/json' }), clerkWebhook);

export default webhookRouter;
