import { clerkClient } from "@clerk/express";

const PREMIUM_PLAN_ID = 'cplan_37cMzh9u5JVZH0NqY8tElEFyhnG';

export const clerkWebhook = async (req, res) => {
  try {
    // req.body may be a Buffer (when using express.raw) or already-parsed object
    let payload = req.body;
    if (Buffer.isBuffer(req.body)) {
      const text = req.body.toString('utf8').trim();
      try {
        payload = text ? JSON.parse(text) : {};
      } catch (err) {
        console.error('Failed to parse webhook JSON body:', err);
        payload = {};
      }
    }

    console.log('=== WEBHOOK RECEIVED ===');
    console.log('Full payload:', JSON.stringify(payload, null, 2));

    const { type, data } = payload || {};

    // Handle subscription events from Clerk Billing
    if (type === 'subscription.created' || type === 'subscription.updated') {
      console.log(`Processing ${type} event`);
      
      // Extract user ID from payer object (Clerk commerce structure)
      const userId = data.payer?.user_id || data.user_id || data.userId || data.object?.user_id;
      
      // Get the actual plan_id from the subscription items
      const actualPlanId = data.items?.[0]?.plan_id || data.plan_id || data.planId || data.object?.plan_id;
      
      const status = data.status || data.object?.status || 'active';
      const subscriptionId = data.id || data.subscription_id || data.object?.id;

      console.log('Extracted data:', { userId, actualPlanId, status, subscriptionId });

      if (userId) {
        // Check if this is the premium plan
        if (actualPlanId === PREMIUM_PLAN_ID) {
          try {
            // Update user with premium status
            await clerkClient.users.updateUser(userId, {
              publicMetadata: {
                subscriptions: [
                  {
                    planId: actualPlanId,
                    status: status,
                    subscriptionId: subscriptionId,
                    updatedAt: new Date().toISOString()
                  }
                ]
              },
              privateMetadata: {
                plan: 'premium' // Fallback for auth middleware
              }
            });

            console.log(`✅ Successfully updated user ${userId} to premium`);
            return res.json({ success: true, message: 'User upgraded to premium' });
          } catch (error) {
            console.error('❌ Error updating user metadata:', error);
            return res.status(500).json({ success: false, message: error.message });
          }
        } else {
          console.log(`ℹ️ User ${userId} subscribed to plan ${actualPlanId} (not premium plan ${PREMIUM_PLAN_ID})`);
          return res.json({ success: true, message: 'Non-premium subscription received' });
        }
      } else {
        console.error('❌ No user_id found in webhook data');
        console.error('Webhook data structure:', JSON.stringify(data, null, 2));
        return res.status(400).json({ success: false, message: 'No user_id in webhook' });
      }
    }

    // Handle subscription cancellation
    if (type === 'subscription.deleted' || type === 'subscription.cancelled') {
      const userId = data.user_id || data.userId || data.object?.user_id;

      if (userId) {
        try {
          await clerkClient.users.updateUser(userId, {
            publicMetadata: {
              subscriptions: []
            },
            privateMetadata: {
              plan: 'free'
            }
          });

          console.log(`✅ Removed premium from user ${userId}`);
          return res.json({ success: true, message: 'Subscription cancelled' });
        } catch (error) {
          console.error('Error removing subscription:', error);
          return res.status(500).json({ success: false, message: error.message });
        }
      }
    }

    // If no matching event type
    console.log(`ℹ️ Unhandled event type: ${type}`);
    res.json({ success: true, message: 'Event received but not processed' });
    
  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Secure manual endpoint to force-update a user's plan (for admin/testing)
export const forceUpdateUser = async (req, res) => {
  try {
    const adminToken = process.env.WEBHOOK_ADMIN_TOKEN;
    const provided = req.headers['x-admin-token'] || req.body?.adminToken;
    if (!adminToken || provided !== adminToken) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { userId, planId } = req.body;
    if (!userId || !planId) {
      return res.status(400).json({ success: false, message: 'userId and planId required' });
    }

    const isPremium = planId === PREMIUM_PLAN_ID;

    await clerkClient.users.updateUser(userId, {
      publicMetadata: isPremium
        ? { subscriptions: [{ planId, status: 'active', updatedAt: new Date().toISOString() }] }
        : { subscriptions: [] },
      privateMetadata: { plan: isPremium ? 'premium' : 'free' }
    });

    return res.json({ success: true, message: `User ${userId} updated to ${isPremium ? 'premium' : 'free'}` });
  } catch (error) {
    console.error('Force update error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
