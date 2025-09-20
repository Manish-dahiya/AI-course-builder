import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { useEffect } from 'react';

function App() {
  const [prompt, setPrompt] = useState("");

  const handleBuildCourse = () => {
    if (!prompt) return alert("Please enter a course idea!");
    console.log("Building course for:", prompt);
    setPrompt("");
  };

  const handleChange=(e)=>{
      const {name,value}=e.target;
      setPrompt(value);
  }

  // useEffect(()=>{ console.log(prompt) },[prompt])

  return (
  <>
      <div className=" bg-blue-100  items-center justify-center p-4">
        <h1 className="text-xl font-bold mb-4 text-center">AI Course Builder</h1>
        <br />

        <input
          type="text"
          placeholder="Enter your course idea..."
          name="course_query"
          value={prompt}
          onChange={(e)=>handleChange(e)}
          className="w-full p-1 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={handleBuildCourse}
          className="w-full bg-blue-600 text-white font-semibold p-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Build Course
        </button>
      </div>
  </>
   
  );
}

export default App;

