import React, { useEffect, useRef, useState } from 'react'

function SideBar({ openModuleIndex  ,setOpenModuleIndex, course, fetchChapterContent, setShowSidebar, showSidebar }) {
    const toggleModule = (index) => {
        setOpenModuleIndex(openModuleIndex === index ? null : index);
    };

    const onSelectChapter = async (chapter, chapIndex) => {
        await fetchChapterContent(chapter,openModuleIndex,chapIndex);
    }

    // useEffect(()=>{ firstChapterRef.current?.click()},[])

    return (
        <div className="w-52  md:w-72  bg-[#2f3a4f] h-screen p-4 overflow-y-auto shadow-lg text-gray-50">
            {/* Course Name */}
            <h2 className=" font-bold mb-4">{course.courseName}</h2>

            {/* Modules */}
            {course.modules?.map((module, index) => (
                <div key={index} className="mb-2">
                    {/* Module Header */}
                    <div
                        className="cursor-pointer bg-[#2f3a4f] px-2 py-1 rounded  hover:bg-[#5f697b] flex justify-between items-center"
                        onClick={() => toggleModule(index)}
                    >
                        <span className="text-xl truncate">{module.title}</span>
                        <span>{openModuleIndex === index ? '-' : '+'}</span>
                    </div>

                    {/* module chapters if that is opened */ }
                     <div  className={`transition-all duration-500 ease-in-out overflow-hidden ${
                        openModuleIndex === index ? "max-h-96 opacity-100 mt-2" : "max-h-0 opacity-0"}`}>
                        <ul className="pl-5 mt-2">
                            {module.chapters?.map((chapter, chapIndex) => (
                                <li
                                    key={chapIndex}

                                    className="py-2 px-1 text-sm cursor-pointer truncate rounded mb-2  hover:bg-[#5f697b]"
                                    onClick={() => onSelectChapter(chapter, chapIndex)}
                                >
                                    {chapter.title}

                                </li>

                            ))}
                        </ul>
                    </div>

                    <hr />
                </div>
            ))}

            <span onClick={() => setShowSidebar(!showSidebar)} className=' sm:hidden' >close</span>
        </div>
    )
}

export default SideBar
