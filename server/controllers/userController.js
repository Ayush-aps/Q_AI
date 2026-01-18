import sql  from '../configs/db.js';
import { clerkClient } from '@clerk/express';

const PREMIUM_PLAN_ID = 'cplan_37cMzh9u5JVZH0NqY8tElEFyhnG';

export const getUserCreations = async (req, res) => {
    try {
        const { userId } = req.auth();
        const creations = await sql`SELECT * FROM creations WHERE user_id = ${userId} ORDER BY created_at DESC`;
    
        res.json({ success: true, creations });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

export const getPublishCreations = async (req, res) => {
    try {
        const creations = await sql`SELECT * FROM creations WHERE publish = true ORDER BY created_at DESC`;
        console.log(`Found ${creations.length} published creations`);
        
        res.json({ success: true, creations });
    } catch (error) {
        console.error('Error fetching published creations:', error);
        res.json({ success: false, message: error.message });
    }
}
export const toggleLikeCreations = async (req, res) => {
    try {
        const { userId } = req.auth();
        const {id} = req.body
        const [creations] = await sql`SELECT * FROM creations WHERE id = ${id}`;
        if(!creations){
            return res.json({success:false , message:"Creation not found"})
        }
         const currentLikes = creations.likes;
         const userIdStr = userId.toString();
         let updatedLikes;
         let message;
         if(currentLikes.includes(userIdStr)){
            updatedLikes = currentLikes.filter((user)=> user !== userIdStr);
            message = 'Creation Unliked'
         } else{
             updatedLikes = [...currentLikes , userIdStr]
             message = 'Creation Liked'
         }

  const formattedArray = `{${updatedLikes.join(',')}}`
  await sql`UPDATE creations SET likes = ${formattedArray}::text[] WHERE id = ${id}`

        
        res.json({ success: true, message });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Immediately confirm and activate premium subscription
export const confirmSubscription = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { planId, subscriptionId } = req.body;

        console.log(`Confirming subscription for user ${userId}, plan: ${planId}`);

        // Verify it's the premium plan
        if (planId !== PREMIUM_PLAN_ID) {
            return res.json({ 
                success: false, 
                message: 'Only premium plan confirmation is supported' 
            });
        }

        // Immediately update Clerk user metadata
        await clerkClient.users.updateUser(userId, {
            publicMetadata: {
                subscriptions: [
                    {
                        planId: planId,
                        status: 'active',
                        subscriptionId: subscriptionId || `manual_${Date.now()}`,
                        updatedAt: new Date().toISOString()
                    }
                ]
            },
            privateMetadata: {
                plan: 'premium',
                free_usage: 0 // Reset free usage
            }
        });

        console.log(`✅ User ${userId} confirmed as premium`);

        res.json({ 
            success: true, 
            message: 'Premium subscription activated!',
            plan: 'premium'
        });
    } catch (error) {
        console.error('Subscription confirmation error:', error);
        res.json({ success: false, message: error.message });
    }
};