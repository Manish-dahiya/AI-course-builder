import React from 'react'
import { Link } from 'react-router-dom';


function CourseCard({courseData}) {


  return (
    <Link to= {`/course/${courseData?._id}`}>
    <div className=" w-44 md:w-52 lg:w-64 bg-white  shadow-md rounded-2xl p-5 mt-6 transition-transform transform hover:scale-105 hover:shadow-xl">
      {/* Course Title */}
      <h1 className="text-lg font-bold text-gray-800 truncate">
        {courseData.courseName}
      </h1>

      {/* Small description (optional) */}
      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
        {courseData.description || "An AI generated course to boost your skills."}
      </p>

      {/* Button */}
      <button className="mt-4 w-full py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
        Explore →
      </button>
    </div>  
    </Link>
   
  )
}

export default CourseCard
