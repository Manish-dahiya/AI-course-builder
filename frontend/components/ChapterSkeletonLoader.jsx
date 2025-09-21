import React from 'react'

function ChapterSkeletonLoader() {
  return (
    <>
      <div className="animate-pulse relative w-lvw  space-y-4">
        {
          [1, 2, 3, 4, 5, 6].map((Element, index) => (
            <div key={index}>
              <div className="h-8 my-7 bg-gray-600 rounded w-1/4"></div>

              <div className="h-8 bg-gray-700 rounded w-2/3 my-2 "></div>
              <div className="h-8 bg-gray-700 rounded w-lg my-2 "></div>
              <div className="h-8 bg-gray-700 rounded w-2/3  my-2 "></div>
              <div className="h-8 bg-gray-700 rounded w-lg my-2 "></div>
            </div>

          ))
        }
      </div>

    </>
  )
}

export default ChapterSkeletonLoader
