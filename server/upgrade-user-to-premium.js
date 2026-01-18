import { Clerk } from '@clerk/clerk-sdk-node';
import 'dotenv/config';

const clerk = new Clerk({ secretKey: process.env.CLERK_SECRET_KEY });

const PREMIUM_PLAN_ID = 'cplan_37cMzh9u5JVZH0NqY8tElEFyhnG';

// Replace with your user ID
const USER_ID = 'user_38NrXfGrgRPt3eqHcfXdC0RhXmP';

async function updateUserToPremium() {
  try {
    console.log(`Updating user ${USER_ID} to premium...`);
    
    await clerk.users.updateUser(USER_ID, {
      publicMetadata: {
        subscriptions: [
          {
            planId: PREMIUM_PLAN_ID,
            status: 'active',
            subscriptionId: 'manual_' + Date.now(),
            updatedAt: new Date().toISOString()
          }
        ]
      },
      privateMetadata: {
        plan: 'premium'
      }
    });

    console.log('✅ Success! User updated to premium.');
    console.log('User can now access premium features!');
    
    // Verify the update
    const user = await clerk.users.getUser(USER_ID);
    console.log('\nUser metadata:');
    console.log('publicMetadata:', JSON.stringify(user.publicMetadata, null, 2));
    console.log('privateMetadata:', JSON.stringify(user.privateMetadata, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateUserToPremium();
