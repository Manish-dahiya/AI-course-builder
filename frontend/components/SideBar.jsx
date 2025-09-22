import React, { useEffect, useRef, useState } from 'react'

function SideBar({ selectedChapter, openModuleIndex  ,setOpenModuleIndex, course, fetchChapterContent, setShowSidebar, showSidebar }) {
    const toggleModule = (index) => {
        setOpenModuleIndex(openModuleIndex === index ? null : index);
    };

    const onSelectChapter = async (chapter, chapIndex) => {
        await fetchChapterContent(chapter,openModuleIndex,chapIndex);
        setShowSidebar(false);
    }

    // useEffect(()=>{ firstChapterRef.current?.click()},[])

    return (
        < >
        
        <div className="w-52 z-10  md:w-72  bg-[#2f3a4f] h-screen p-4 overflow-y-auto shadow-lg text-gray-50">
            {/* Course Name */}
            <h2 className=" font-bold mb-4">{course.courseName}</h2>

            {/* Modules */}
            {course.modules?.map((module, index) => (
                <div key={index} className="mb-2">
                    {/* Module Header */}
                    <div
                        className={`cursor-pointer bg-[#2f3a4f] px-2 sm:py-1 rounded  hover:bg-[#5f697b] flex justify-between items-center gap-4 ${openModuleIndex === index ? 'bg-[#5f697b] py-1' : 'bg-[#2f3a4f]'} `}
                        onClick={() => toggleModule(index)}
                    >
                        <span className="text-small  truncate">{module.title}</span>
                        <span>{openModuleIndex === index ? '-' : '+'}</span>
                    </div>

                    {/* module chapters if that is opened */ }
                     <div  className={`transition-all duration-500 ease-in-out overflow-hidden ${
                        openModuleIndex === index ? "max-h-96 opacity-100  mt-2" : "max-h-0 opacity-0"}`}>
                        <ul className="text-left sm:mt-2">
                            {module.chapters?.map((chapter, chapIndex) => (
                                <li
                                    key={chapIndex}

                                    className={` py-1 sm:py-2 px-1 text-small  text-[#c9cbd4] cursor-pointer truncate rounded mb-2  hover:bg-[#5f697b] ${chapter._id==selectedChapter._id? 'border-b':'border-0'  } `}
                                    onClick={() => onSelectChapter(chapter, chapIndex)}
                                >
                                    <span className='mx-1 '> {chapIndex+1} </span>{chapter.title}

                                </li>

                            ))}
                        </ul>
                    </div>

                    {/* <hr /> */}
                </div>
            ))}

            <span onClick={() => setShowSidebar(!showSidebar)} className=' sm:hidden cursor-pointer' >close</span>
        </div>

            </>
    )
}

export default SideBar
