import { clerkClient } from '@clerk/express';

// Your Clerk Premium Plan ID
const PREMIUM_PLAN_ID = 'cplan_37cMzh9u5JVZH0NqY8tElEFyhnG';

export const auth = async (req, res, next) => {
  try {
    const { userId } = req.auth();
    const user = await clerkClient.users.getUser(userId);
    
    // Check for premium plan in user metadata
    let isPremium = false;
    
    // Check if user has the plan in their publicMetadata (from Clerk pricing table)
    if (user.publicMetadata?.subscriptions) {
      isPremium = user.publicMetadata.subscriptions.some(
        sub => sub.planId === PREMIUM_PLAN_ID && sub.status === 'active'
      );
    }
    
    // Also check privateMetadata (manual override in Clerk dashboard)
    if (!isPremium && user.privateMetadata?.plan === 'premium') {
      isPremium = true;
    }

    // Update free usage tracking
    if (!isPremium && user.privateMetadata?.free_usage) {
      req.free_usage = user.privateMetadata.free_usage;
    } else if (!isPremium) {
      await clerkClient.users.updateUser(userId, {
        privateMetadata: {
          free_usage: user.privateMetadata?.free_usage || 0
        }
      });
      req.free_usage = user.privateMetadata?.free_usage || 0;
    } else {
      req.free_usage = 0;
    }

    req.plan = isPremium ? 'premium' : 'free';
    console.log(`User ${userId} plan: ${req.plan}, subscriptions:`, user.publicMetadata?.subscriptions || 'none');
    next();

  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ success: false, message: error.message });
  }
};
