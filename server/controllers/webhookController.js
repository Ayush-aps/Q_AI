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
      
      // Extract user ID from different possible locations
      const userId = data.user_id || data.userId || data.object?.user_id;
      const planId = data.plan_id || data.planId || data.object?.plan_id || PREMIUM_PLAN_ID;
      const status = data.status || data.object?.status || 'active';
      const subscriptionId = data.id || data.subscription_id || data.object?.id;

      console.log('Extracted data:', { userId, planId, status, subscriptionId });

      if (userId) {
        try {
          // Update user with premium status
          await clerkClient.users.updateUser(userId, {
            publicMetadata: {
              subscriptions: [
                {
                  planId: planId,
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
        console.error('❌ No user_id found in webhook data');
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
