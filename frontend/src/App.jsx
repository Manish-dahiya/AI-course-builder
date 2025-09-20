import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { useEffect } from 'react';
import CourseCard from '../components/CourseCard';
import { BrowserRouter,Routes , Route } from 'react-router-dom';
import Home from '../pages/Home';
import CoursePage from '../pages/CoursePage';

function App() {
  const [prompt, setPrompt] = useState("");
  const [courseData,setCourseData]= useState({"coursePlan":{"courseName":"youtune mastery course: this is amazing"} });
  const [isLoading,setIsLoading]= useState(false)

  const handleBuildCourse = async() => {
    if (!prompt) return alert("Please enter a course idea!");
    
    try{
      setIsLoading(true)

        const res= await  fetch(`http://localhost:5000/api/courses/generate-course`, {
          method:"POST",
          headers:{
            "Content-Type":"application/json"
          },
          body:JSON.stringify( {"prompt":prompt})

        } );

        if (!res.ok) throw new Error("Failed to generate course");

        const data= await res.json();
        setCourseData(data)

        console.log("aa gya data bhai frontend pe bhi",data);

    }
    catch(error){
       console.error("frontend error :",error );
      alert("Something went wrong while building the course");
    }

    setIsLoading(false);
    setPrompt("");
  };

  const handleChange=(e)=>{
      const {name,value}=e.target;
      setPrompt(value);
  }


  useEffect(()=>{ console.log("useeffect") },[courseData])

  return (
  <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home></Home>}  > </Route>
          <Route path="course/:id" element={<CoursePage/>} ></Route>          

        </Routes>
      </BrowserRouter>
  </>
   
  );
}

export default App;

