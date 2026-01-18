import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import axios from 'axios'
import toast from 'react-hot-toast'

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const SubscriptionSuccess = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const confirmPremium = async () => {
      if (!user) return;

      try {
        console.log('Activating premium subscription...');
        
        const { data } = await axios.post('/api/user/confirm-subscription', {
          planId: 'cplan_37cMzh9u5JVZH0NqY8tElEFyhnG',
          subscriptionId: 'clerk_' + Date.now()
        }, {
          headers: {
            Authorization: `Bearer ${await user.getToken()}`
          }
        });

        if (data.success) {
          toast.success('🎉 Premium activated! Redirecting to dashboard...');
          await user.reload(); // Refresh user metadata
          setTimeout(() => navigate('/dashboard'), 2000);
        } else {
          toast.error(data.message || 'Failed to activate premium');
          navigate('/pricing');
        }
      } catch (error) {
        console.error('Activation error:', error);
        toast.error('Failed to activate premium. Please contact support.');
        navigate('/pricing');
      }
    };

    confirmPremium();
  }, [user, navigate]);

  return (
    <div className='flex items-center justify-center h-screen'>
      <div className='text-center'>
        <div className='w-16 h-16 mx-auto mb-4 border-4 border-green-500 border-t-transparent rounded-full animate-spin'></div>
        <h2 className='text-2xl font-semibold text-gray-800'>Activating Premium...</h2>
        <p className='text-gray-600 mt-2'>Please wait while we set up your account</p>
      </div>
    </div>
  )
}

export default SubscriptionSuccess
