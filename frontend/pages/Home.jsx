import { useContext, useState } from 'react'
import reactLogo from '../src/assets/react.svg'
import viteLogo from '/vite.svg'
import '../src/App.css'
import { useEffect } from 'react';
import CourseCard from '../components/CourseCard';
import { API_BASE_URL } from "../src/utility/helper"

import { useAuth0 } from "@auth0/auth0-react";
import { UserContext } from "../src/contexts/UserContextProvider";  // 👈 import context
import UserProfilePopup from '../components/UserProfilePopup';
import userIcon from "../src/assets/userIcon.png"


function Home() {
  const { currentUser } = useContext(UserContext);
  console.log(currentUser);

  const [prompt, setPrompt] = useState("");
  // const [courseData,setCourseData]= useState({"coursePlan":{"courseName":"youtune mastery course: this is amazing"} });
  const [isLoading, setIsLoading] = useState(false)
  const [allCourses, setAllCourses] = useState([]);
  const [profilePopup, setProfilePopup] = useState(false);

  //api for building the course
  const handleBuildCourse = async () => {
    if (!prompt) return alert("Please enter a course idea!");

    try {
      setIsLoading(true)

      const res = await fetch(`${API_BASE_URL}/api/courses/generate-course`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ "prompt": prompt, "userId": currentUser?._id })

      });

      if (res.status == 400) throw new Error("Failed to generate course");

      const data = await res.json();
      console.log("data.coursePlan:", data.coursePlan);

      // setCourseData(data)
      //prepend this in allCourses
      setAllCourses(prev => [data.coursePlan, ...(Array.isArray(prev) ? prev : [])]);
    }
    catch (error) {
      console.error("frontend error :", error);
      alert("Something went wrong while building the course");
    }

    setIsLoading(false);
    setPrompt("");
  };

  //api for fetching all courses
  const fetchAllCourses = async () => {
    // const res= await fetch(`${API_BASE_URL}/api/courses/all-courses`);
    // const data= await res.json();

    // setAllCourses(data.allCourses);
    setAllCourses(currentUser.courses);
  }

  useEffect(() => {
    if(currentUser) fetchAllCourses() 
    }, [currentUser]) //everytime on load of this page

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPrompt(value);
  }


  if (!currentUser) return <div>Loading user...</div>;


  return (
    <>
      <UserProfilePopup profilePopup={profilePopup} setProfilePopup={setProfilePopup} />


      <div className=" bg-blue-100  items-center justify-center p-4">

        {/* user profile icon */}
        <div className=' sm:h-16 flex justify-between items-center'>
          <div> </div>
          <h1 className="text-xl font-bold  sm:mb-4 text-center">AI Course Builder</h1>

          <button className='h-10 w-10 rounded-full border border-gray-600' onClick={() => setProfilePopup(!profilePopup)} >
            <img src={userIcon} alt="" />
          </button>


        </div>
        <br />

        {!isLoading ? <input
          type="text"
          placeholder="Enter your course idea..."
          name="course_query"
          value={prompt}
          onChange={(e) => handleChange(e)}
          className="w-full h-10 sm:h-14 p-1 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        /> : <h1 className=' text-gray-400 mb-1 skeleton-text  text-center'>we are creating the best course for you </h1>}

        {!isLoading ? <button
          onClick={handleBuildCourse}
          className="w-full bg-blue-600 hover:scale-95 transition-transform text-white font-semibold h-10 sm:h-14 sm:p-3 rounded-lg hover:bg-blue-700 "
        >
          Build Course
        </button>
          : <button type="button" className='w-full     bg-blue-600 text-white font-semibold p-2 h-14 rounded-lg hover:bg-blue-700 ' disabled>
            <span className='flex justify-center items-center gap-4'> <div className='spin-loader' ></div>     </span>
          </button>
        }
      </div>

      {/*  all courses section */}
      <section className='flex flex-wrap gap-5 sm:gap-6 justify-center items-center '  >
        {
          allCourses && allCourses?.map((courseD, courseIndex) => (
            <div key={courseIndex} className="  items-center justify-center " > {courseD && <CourseCard courseData={courseD} allCourses={allCourses} setAllCourses={setAllCourses} />} </div>
          ))
        }
      </section>

    </ >
  )
}

export default Home
