import React, { useState } from 'react'
import Markdown from 'react-markdown';
const Creationitem = ({item}) => {
    const [expanded, setExpanded] = useState(false)
  return (
    <div onClick={() => setExpanded(!expanded)} className='p-4 max-w-5xl text-sm bg-white border border-gray-200 rounded-lg '>
        <div className='flex items-center justify-between gap-4'>
       <div>
            <h2 className='font-semibold'>{item.prompt}</h2>
            <p className='text-gray-500'>{item.type}- {new Date(item.created_at).toLocaleDateString()}</p>
       </div>
       <button className='bg-[#EFF6FF] border border-[#BFDBFE] text-[#1E40AF] px-4 py-1 rounded-full'>{item.type}</button>
        </div>

      {
        expanded && (
          <div>
            {item.type === 'image' ? (
                <div>
              <img src={item.content} alt="image" className='mt-3 w-full max-w-md' />
              </div>
            ) : (       
                <div className='mt-3 h-full overflow-y-scroll text-sm text-slate-700'>
                    <div className='reset-tw'>
                        {/* yaha pe extra space nahi de sakte hai child me */}
                       <Markdown>{item.content}</Markdown>
                    </div>
                </div>
                )}
          </div>
        )}  
        </div>
  )
}
        


export default Creationitem
