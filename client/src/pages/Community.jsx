import React, { useEffect, useState } from 'react'
import {useUser} from '@clerk/clerk-react'
import { Heart } from 'lucide-react'
import toast from 'react-hot-toast';
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const Community = () => {
  const [creations , setCreations] = useState([])
  const {user} = useUser()
  const [loading , setLoading] = useState(true)
   const {getToken} = useAuth()
  const fetchCreations = async () => {
    try {
      // Only include auth header when user is signed in
      const headers = {};
      if (user) {
        headers.Authorization = `Bearer ${await getToken()}`;
      }

      console.log('Fetching published creations...');
      const {data} = await axios.get('/api/user/get-published-creations', { headers })
      console.log('Response:', data);
      
      if(data.success){
         console.log(`Found ${data.creations.length} published creations`);
         setCreations(data.creations)
      } else{
         console.error('Failed to fetch:', data.message);
         toast.error(data.message)
      }
    } catch (error) {
       console.error('Error fetching creations:', error);
       toast.error(error.message)
    }
    setLoading(false)
  }
    const imageLikeToggle = async (id)=>{
       try {
        const {data} = await axios.post('/api/user/toggle-like-creations',{id} ,{headers:{Authorization: `Bearer ${await getToken()}`}})
        if(data.success){
          toast.success(data.message)
          await fetchCreations()
        } else{
          toast.error(data.message)
        }
       } catch (error) {
         toast.error(error.message)
       }
    }
  useEffect(() => {
   // Fetch community creations for all visitors; auth header added when user exists
   fetchCreations()
 }, [user])

  return !loading ? (
    <div className='flex-1 h-full flex flex-col gap-4 p-6'>
      <div className='bg-white h-full rounded-xl overflow-y-scroll p-4'>
        {
          creations.length > 0 ? (
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
              {creations.map((creation, index) => (
                <div key={creation.id || index} className='relative group'>
                  <img src={creation.content} alt={creation.prompt || 'AI Generated'} className='w-full aspect-square object-cover rounded-lg' />
                  <div className='absolute bottom-0 top-0 right-0 left-0 flex gap-2 items-end justify-end group-hover:justify-between p-3 group-hover:bg-gradient-to-b from-transparent to-black/80 text-white rounded-lg'>
                    <p className='text-sm hidden group-hover:block'>{creation.prompt}</p>
                    {user && (
                      <div className='flex gap-1 items-center'>
                        <p>{creation.likes?.length || 0}</p>
                        <Heart onClick={()=> imageLikeToggle(creation.id)} className={`min-w-5 h-5 hover:scale-110 cursor-pointer ${creation.likes?.includes(user.id) ? 'fill-red-500 text-red-600':'text-white'}`}/>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='flex flex-col items-center justify-center h-full text-gray-400'>
              <Heart className='w-16 h-16 mb-4' />
              <p className='text-lg font-medium'>No community creations yet</p>
              <p className='text-sm'>Be the first to share your AI-generated content!</p>
            </div>
          )
        }
      </div>
    </div>
  ) :(
     <div className='flex justify-center items-center h-full'>
      <span className='w-10 h-10 my-1 rounded-full border-3 border-primary border-t-transparent animate-spin'>

      </span>
     </div>
  )
}


export default Community
