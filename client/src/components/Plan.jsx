import React, { useEffect } from 'react'
import {PricingTable, useUser} from '@clerk/clerk-react'
import axios from 'axios'
import toast from 'react-hot-toast'

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const Plan = () => {
  const { user } = useUser();

  useEffect(() => {
    // Listen for successful subscription from Clerk
    const handleSubscriptionSuccess = async () => {
      try {
        // Check if user just subscribed (you can add more sophisticated detection)
        const urlParams = new URLSearchParams(window.location.search);
        const subscriptionId = urlParams.get('subscription_id');
        
        if (subscriptionId && user) {
          console.log('Confirming subscription...');
          
          const { data } = await axios.post('/api/user/confirm-subscription', {
            planId: 'cplan_37cMzh9u5JVZH0NqY8tElEFyhnG',
            subscriptionId: subscriptionId
          }, {
            headers: {
              Authorization: `Bearer ${await user.getToken()}`
            }
          });

          if (data.success) {
            toast.success('🎉 Premium activated! You now have full access.');
            // Refresh user data to get updated metadata
            await user.reload();
            // Redirect to dashboard
            setTimeout(() => window.location.href = '/dashboard', 2000);
          } else {
            toast.error(data.message || 'Failed to activate premium');
          }
        }
      } catch (error) {
        console.error('Subscription confirmation error:', error);
      }
    };

    if (user) {
      handleSubscriptionSuccess();
    }
  }, [user]);

  return (
    <div className='max-w-2xl mx-auto z-20 my-30'>
      <div className='text-center'>
     <h2 className='text-slate-700 text-[42px] font-semibold'>Choose Your Plan</h2>
     <p className='text-gray-500 max-w-lg mx-auto'>Start for free and scale up as you grow. Find the perfect plan for your content creation needs.</p>
      </div>
      <div className='mt-14 max-sm:mx-8'>
        <PricingTable/> 
      </div>
    </div>
  )
}

export default Plan

