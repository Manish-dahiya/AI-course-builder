import React from 'react'

function ChapterSkeletonLoader() {
  return (
    <>
    {/* <div className="animate-pulse   space-y-4">
      <div className="h-8 my-10 bg-gray-600 rounded w-1/3">

      </div>
      <div className="h-4 bg-gray-700 rounded w-5/6"></div>
      <div className="h-4 bg-gray-700 rounded w-4/6"></div>
      <div className="h-4 bg-gray-700 rounded w-2/3"></div>
      <div className="h-4 bg-gray-700 rounded w-3/5"></div>
    </div> */}

<div className="animate-pulse   space-y-4">
    {
        [1,2,3,4,5,6].map((Element,index)=>(
           <>
             <div className="h-8 my-7 bg-gray-600 rounded w-1/3"></div>

        <div className="h-5 bg-gray-700 rounded w-lg my-2 "></div>
      <div className="h-5 bg-gray-700 rounded w-lg my-2 "></div>
      <div className="h-5 bg-gray-700 rounded w-lg my-2 "></div>
      <div className="h-5 bg-gray-700 rounded w-lg my-2 "></div>
            </>

        ))
    }
    </div>

    </>
  )
}

export default ChapterSkeletonLoader
