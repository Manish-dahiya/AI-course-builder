import React, { useContext } from 'react'
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../src/utility/helper';
import { UserContext } from '../src/contexts/UserContextProvider';
import toast from 'react-hot-toast';


function CourseCard({ courseData, allCourses, setAllCourses }) {
  const { currentUser } = useContext(UserContext)


  const handleDelete = async () => {
    //  remove deleted course from UI
    const updatedCourses = allCourses.filter(
      (course) => course && course._id && course._id !== courseData._id
    );
    setAllCourses(updatedCourses);

    const res = await fetch(`${API_BASE_URL}/api/courses/delete-course/${courseData._id}`)
    if (res.ok) {
      const data =await res.json();
      toast.success(data.message);
      if (currentUser?._id == "guestId") {
        
        const guestObj = { userName: "Guest", _id: "guestId", courses: updatedCourses };
        localStorage.setItem("guestUser", JSON.stringify(guestObj));
      }

    }
    else console.log("some error in response while deleting");
  }

  return (
    // <Link to= {`/course/${courseData?._id}`}>
    <div className="w-32 h-36 sm:w-44 sm:h-48  md:h-56 md:w-52 lg:w-64 bg-white  shadow-md rounded-2xl p-3 sm:p-5 mt-4 sm:mt-6 transition-transform transform hover:scale-105 hover:shadow-xl">
      {/* Course Title */}
      <h1 className=" text-sm sm:text-lg font-bold text-gray-800 truncate">
        {courseData.courseName}
      </h1>

      {/* Small description (optional) */}
      <p className="text-small sm:text-lg text-gray-600 mt-2 line-clamp-2">
        {courseData.description || "An AI generated course to boost your skills."}
      </p>

      {/* Button */}
      <Link to={`/course/${courseData?._id}`}>
        <button className="mt-4 w-full text-small py-1 sm:text-sm sm:py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
          Explore →
        </button>
      </Link>

      <button className=" w-1/3 text-small  mt-1  hover:bg-red-600 hover:text-white font-semibold rounded-lg bg-white text-red-600 border border-red-600 transition-colors"
        onClick={handleDelete}
      >
        delete
      </button>
    </div>

  )
}

export default CourseCard
