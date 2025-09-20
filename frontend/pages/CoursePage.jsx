import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function CoursePage({courseData}) {
//   const [selectedChapter,setSelectedChapter]= useState(courseData.modules[0].chapters[0]);
  const [selectedChapter,setSelectedChapter]= useState();



//   if (!course) return <div>Loading...</div>;

  return (
    <div className="flex h-screen">
        <div></div>

        {/* main content */}
        <div> 
            
            <h1>{selectedChapter?.title}</h1>
            <p>{selectedChapter?.aiContent}</p>
        </div>

    </div>
  );
}

export default CoursePage;
