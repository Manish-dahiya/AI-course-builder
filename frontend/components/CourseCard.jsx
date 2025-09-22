import React from 'react'
import { Link } from 'react-router-dom';


function CourseCard({courseData}) {


  return (
    <Link to= {`/course/${courseData?._id}`}>
    <div className="w-32 h-32 sm:w-44 sm:h-44  md:h-52 md:w-52 lg:w-64 bg-white  shadow-md rounded-2xl p-3 sm:p-5 mt-4 sm:mt-6 transition-transform transform hover:scale-105 hover:shadow-xl">
      {/* Course Title */}
      <h1 className=" text-sm sm:text-lg font-bold text-gray-800 truncate">
        {courseData.courseName}
      </h1>

      {/* Small description (optional) */}
      <p className="text-small sm:text-lg text-gray-600 mt-2 line-clamp-2">
        {courseData.description || "An AI generated course to boost your skills."}
      </p>

      {/* Button */}
      <button className="mt-4 w-full text-small py-1 sm:text-sm sm:py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
        Explore →
      </button>
    </div>  
    </Link>
   
  )
}

export default CourseCard
