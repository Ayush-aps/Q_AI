import express from 'express';
import { clerkWebhook, forceUpdateUser } from '../controllers/webhookController.js';

const webhookRouter = express.Router();

// Clerk webhook endpoint - use raw body parser to avoid JSON parse errors
webhookRouter.post('/clerk', express.raw({ type: 'application/json' }), clerkWebhook);

// Admin route to force-update user metadata (accepts JSON)
webhookRouter.post('/clerk/force-update', express.json(), forceUpdateUser);

export default webhookRouter;
