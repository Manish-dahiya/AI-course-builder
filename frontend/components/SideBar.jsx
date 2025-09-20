import React, { useState } from 'react'

function SideBar({courseData,setSelectedChapter}) {
    const [openModuleIndex, setOpenModuleIndex] = useState(null);

  const toggleModule = (index) => {
    setOpenModuleIndex(openModuleIndex === index ? null : index);
  };

  const onSelectChapter=(chapter)=>{
    setSelectedChapter(chapter);
  }

  return (
        <div className="w-52 bg-[#2f3a4f] h-screen p-4 overflow-y-auto shadow-lg text-gray-50">
      {/* Course Name */}
      <h2 className=" font-bold mb-4">{courseData.courseName}</h2>

      {/* Modules */}
      {courseData.modules?.map((module, index) => (
        <div key={index} className="mb-2">
          {/* Module Header */}
          <div
            className="cursor-pointer bg-[#2f3a4f] px-2 py-1 rounded  hover:bg-[#5f697b] flex justify-between items-center"
            onClick={() => toggleModule(index)}
          >
            <span className="text-sm truncate">{module.title}</span>
            <span>{openModuleIndex === index ? '-' : '+'}</span>
          </div>

          {/* Chapters (visible only if module is open) */}
          {openModuleIndex === index && (
            <ul className="pl-5 mt-2">
              {module.chapters?.map((chapter, chapIndex) => (
                <li
                  key={chapIndex}
                  className="py-2 px-1 text-small cursor-pointer truncate rounded mb-2  hover:bg-[#5f697b]"
                  onClick={() => onSelectChapter(chapter)}
                >
                  {chapter.title}
                  
                </li>
                
              ))}
            </ul>
          )}
          <hr />
        </div>
      ))}
    </div>
  )
}

export default SideBar
