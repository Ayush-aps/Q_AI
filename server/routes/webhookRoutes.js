import express from 'express';
import { clerkWebhook } from '../controllers/webhookController.js';

const webhookRouter = express.Router();

// Clerk webhook endpoint
webhookRouter.post('/clerk', clerkWebhook);

export default webhookRouter;
