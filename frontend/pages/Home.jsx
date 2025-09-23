import { useState } from 'react'
import reactLogo from '../src/assets/react.svg'
import viteLogo from '/vite.svg'
import '../src/App.css'
import { useEffect } from 'react';
import CourseCard from '../components/CourseCard';
import {API_BASE_URL} from "../src/utility/helper"

function Home() {
     const [prompt, setPrompt] = useState("");
      // const [courseData,setCourseData]= useState({"coursePlan":{"courseName":"youtune mastery course: this is amazing"} });
      const [isLoading,setIsLoading]= useState(false)
      const [allCourses,setAllCourses]= useState(null);
    
      //api for building the course
      const handleBuildCourse = async() => {
        if (!prompt) return alert("Please enter a course idea!");
        
        try{
          setIsLoading(true)
    
            const res= await  fetch(`${API_BASE_URL}/api/courses/generate-course`, {
              method:"POST",
              headers:{
                "Content-Type":"application/json"
              },
              body:JSON.stringify( {"prompt":prompt})
    
            } );
    
            if (res.status==400) throw new Error("Failed to generate course");
    
            const data= await res.json();
            // setCourseData(data)
            //prepend this in allCourses
            setAllCourses(prev => [data.coursePlan, ...prev]);    
        }
        catch(error){
           console.error("frontend error :",error );
          alert("Something went wrong while building the course");
        }
    
        setIsLoading(false);
        setPrompt("");
      };

      //api for fetching all courses
      const fetchAllCourses=async()=>{
        const res= await fetch(`${API_BASE_URL}/api/courses/all-courses`);
        const data= await res.json();

        setAllCourses(data.allCourses);
      }
      useEffect(()=>{ fetchAllCourses()  },[]) //everytime on load of this page
    
      const handleChange=(e)=>{
          const {name,value}=e.target;
          setPrompt(value);
      }
    
    
      // useEffect(()=>{ console.log("useeffect") },[courseData])
  return (
    <>
         <div className=" bg-blue-100  items-center justify-center p-4">
        <h1 className="text-xl font-bold  sm:mb-4 text-center">AI Course Builder</h1>
        <br />

        { !isLoading ? <input
          type="text"
          placeholder="Enter your course idea..."
          name="course_query"
          value={prompt}
          onChange={(e)=>handleChange(e)}
          className="w-full h-10 sm:h-14 p-1 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        /> : <h1 className=' text-gray-400 mb-1 skeleton-text  text-center'>we are creating the best course for you </h1> }

        { !isLoading ?  <button
          onClick={handleBuildCourse}
          className="w-full bg-blue-600 hover:scale-95 transition-transform text-white font-semibold h-10 sm:h-14 sm:p-3 rounded-lg hover:bg-blue-700 "
        >
          Build Course
        </button>
        :<button type="button" className='w-full     bg-blue-600 text-white font-semibold p-2 h-14 rounded-lg hover:bg-blue-700 ' disabled>
           <span className='flex justify-center items-center gap-4'> <div className='spin-loader' ></div>     </span>  
          </button>
          }
      </div>

      {/*  all courses section */ }
      <section className='flex flex-wrap gap-5 sm:gap-6 justify-center items-center '  >
           {
             allCourses && allCourses?.map((courseD,courseIndex) => ( 
                  <div key={courseIndex} className="  items-center justify-center " > {courseD  && <CourseCard  courseData={courseD} />} </div> 
              )) 
            }  
      </section>    
          
    </>
  )
}

export default Home
