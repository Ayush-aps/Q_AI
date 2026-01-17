import express from 'express';
import { clerkClient } from '@clerk/express';

const testRouter = express.Router();

// Test endpoint to check user subscription status
testRouter.get('/check-subscription', async (req, res) => {
  try {
    const { userId } = req.auth();
    const user = await clerkClient.users.getUser(userId);
    
    res.json({
      success: true,
      userId,
      publicMetadata: user.publicMetadata,
      privateMetadata: user.privateMetadata,
      plan: req.plan,
      free_usage: req.free_usage
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

export default testRouter;
