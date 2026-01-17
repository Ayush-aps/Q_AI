import { clerkClient } from "@clerk/express";

const PREMIUM_PLAN_ID = 'cplan_37cMzh9u5JVZH0NqY8tElEFyhnG';

export const clerkWebhook = async (req, res) => {
  try {
    const { type, data } = req.body;

    console.log('Webhook received:', type);
    console.log('Webhook data:', JSON.stringify(data, null, 2));

    // Handle subscription events
    if (type === 'subscription.created' || type === 'subscription.updated') {
      const { id: subscriptionId, status, user_id, plan_id } = data;

      console.log(`Processing subscription ${type}:`, {
        subscriptionId,
        status,
        user_id,
        plan_id
      });

      // Update user metadata with subscription info
      if (user_id && plan_id === PREMIUM_PLAN_ID) {
        try {
          await clerkClient.users.updateUser(user_id, {
            publicMetadata: {
              subscriptions: [
                {
                  planId: plan_id,
                  status: status,
                  subscriptionId: subscriptionId
                }
              ]
            }
          });

          console.log(`✅ Updated user ${user_id} metadata with subscription`);
        } catch (error) {
          console.error('Error updating user metadata:', error);
        }
      }
    }

    // Handle subscription deletion/cancellation
    if (type === 'subscription.deleted') {
      const { user_id } = data;

      if (user_id) {
        try {
          await clerkClient.users.updateUser(user_id, {
            publicMetadata: {
              subscriptions: []
            }
          });

          console.log(`✅ Removed subscription from user ${user_id}`);
        } catch (error) {
          console.error('Error removing subscription:', error);
        }
      }
    }

    res.json({ success: true, message: 'Webhook processed' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};
