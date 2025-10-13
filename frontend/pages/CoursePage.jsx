import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import SideBar from '../components/SideBar';
import ReactMarkdown from 'react-markdown';
import ChapterSkeletonLoader from '../components/ChapterSkeletonLoader';
import ChapterVideoPlayer from '../components/ChapterVideoPlayer';

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { downloadPDF } from '../src/utility/helper.js'
import { API_BASE_URL } from '../src/utility/helper.js';
import GenerateAudio from '../components/GenerateAudio.jsx';
import AudioLoader from '../components/AudioLoader.jsx';
import ChapterMcqs from '../components/ChapterMcqs.jsx';
import toast from 'react-hot-toast';
import LoadingScreen from '../components/LoadingScreen.jsx';

function CoursePage() {
    const { id } = useParams();
    //can be moved to context
    const [course, setCourse] = useState(null);
    const [selectedChapter, setSelectedChapter] = useState({});
    const [openModuleIndex, setOpenModuleIndex] = useState(0);

    const [showSidebar, setShowSidebar] = useState(true);
    const [expanded, setExpanded] = useState(false);
    const [isLoading, setIsLoading] = useState(true);//for the loading of the chapter content 
    const [isVideoLoading, setIsVideoLoading] = useState(false);

    const [isVideo, setIsVideo] = useState(false);
    const [isQuestions, setIsQuestions] = useState(false);

    const pdfRef = useRef();



    //-------------- Split content by line breaks
    const contentLines = selectedChapter?.aiContent?.split('\n');

    const displayedContent = expanded
        ? contentLines?.join('\n') // show all
        : contentLines?.slice(0, 20).join('\n'); // show first N lines

    //-------


    const fetchCourse = async (s) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/courses/${id}`);
            if (res.ok) {
                const data = await res.json();
                setCourse(data.coursePlan);
                setSelectedChapter(data.coursePlan.modules[0].chapters[0]);
                //fetch course' first modules's first chapter as soon as you come on the coursePage.
                await fetchChapterContent(data.coursePlan.modules[0].chapters[0], 0, 0, data.coursePlan);
            }
        } catch (error) {
            console.log("Error fetching course:", error);
        }
    };

    //this will be called in sidebar 
    const fetchChapterContent = async (chapter, openModuleIndex, chapIndex, courseData = course) => {
        setIsQuestions(false); //<---set the questions div false by default.
        setSelectedChapter(chapter);

        setIsLoading(true)
        if (chapter.aiContent.length == 0) {
            //over here you have to make an api call to generate the content of this chapter
            const res = await fetch(`${API_BASE_URL}/api/courses/chapter`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ "courseId": courseData._id, "moduleId": courseData.modules[openModuleIndex]._id, "chapterId": chapter._id })
            })

            const data = await res.json();
            setSelectedChapter(data.course.modules[openModuleIndex].chapters[chapIndex]);
            setCourse(data.course)
        }
        setIsLoading(false)
    }

    const fetchChapterVideo = async () => {
        console.log(openModuleIndex)
        setIsVideoLoading(true);
        if (selectedChapter?.videoUrl == "") {
            const res = await fetch(`${API_BASE_URL}/api/courses/chapter/get-chapter-video`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ "courseId": course._id, "moduleIndex": openModuleIndex, "chapterId": selectedChapter._id })
            })
            const data = await res.json();
            console.log("yes saved!!", data);
            setCourse(data.course);
            setSelectedChapter(data.chapter);

        }
        setIsVideoLoading(false);
    }

    const handleVideoButtonClick = () => {
        // Immediately toggle the video div
        setIsVideo(!isVideo);

        // Only fetch if videoUrl is empty
        if (selectedChapter?.videoUrl === "") {
            fetchChapterVideo(); // async call will update the chapter and stop loading when done
        }
    };

    const handleMarkAsRead = async () => {
        setSelectedChapter(prev => ({
            ...prev,
            isRead: !prev?.isRead
        }));
        try {
            const res = await fetch(`${API_BASE_URL}/api/courses/chapter/mark-as-read/${selectedChapter?._id}`);
            if (!res.ok) {
                //if the res is not ok ,then revert the changes made above.
                setSelectedChapter(prev => ({
                    ...prev,
                    isRead: !prev?.isRead
                }));
                
            }
            else toast.success("chapter marked ");
        } catch (error) {
            console.log(error)
        }
    }

    const fetchChapterQuestions=async()=>{
        setIsQuestions((prev=>!prev));
        if ( selectedChapter?.questions?.length == 0) {

            const res = await fetch(`${API_BASE_URL}/api/courses/chapter/questions/${selectedChapter?._id}`)
            const data = await res.json();
            
            setCourse(data.course);
            setSelectedChapter(data.chapter);
        }
    }


    useEffect(() => {
      
        fetchCourse();
    }, [id]);


    if (!course) return <LoadingScreen/>;
    // return <LoadingScreen/>

    return (
        <div className="flex h-screen  ">

            {showSidebar && <div id='overlay-div-for-sidebar' onClick={() => setShowSidebar(false)}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'transparent',
                    zIndex: 1,
                }} >

            </div>}
            <div
                className={`fixed top-0 left-0 z-20 h-full transition-transform duration-300 ease-in-out
            ${showSidebar ? 'translate-x-0' : '-translate-x-full'} sm:translate-x-0`}
            >
                <SideBar selectedChapter={selectedChapter} openModuleIndex={openModuleIndex} setOpenModuleIndex={setOpenModuleIndex} course={course} fetchChapterContent={fetchChapterContent} setShowSidebar={setShowSidebar} showSidebar={showSidebar} />

            </div>


            {/* main content */}
            <div className='text-gray-300  fade-in-down  sm:ml-42 md:ml-72 w-full  ' >

                {isLoading ? <ChapterSkeletonLoader /> :
                    <div className=' pb-10' >
                        {/* <h1 className='font-bold  sm:text-4xl mb-3 '>{selectedChapter?.title || "No chapter selected"}</h1> */}

                        {/* youtube video functionality */}
                        <section id="youtube-video-section" className="w-full">


                            <div className='flex flex-wrap justify-center sm:justify-start items-center my-2 gap-3 sm:gap-5 sm:font-semibold'>
                                <span onClick={() => setShowSidebar(!showSidebar)} className={`text-white font-bold text-2xl mt-1 sm:mt-0 cursor-pointer sm:hidden`} > &#9776; </span>
                                <button
                                    className="flex items-center px-1 py-1 sm:px-4 sm:py-2  text-small sm:text-sm bg-[#ff0033] hover:bg-blue-900 text-white font-semibold rounded-md transition-colors duration-300"
                                    onClick={handleVideoButtonClick}
                                >
                                    Video
                                </button>
                                <button
                                    onClick={() => downloadPDF(pdfRef, selectedChapter?.title)}
                                    className="px-1 py-1 sm:px-4 sm:py-2 text-small sm:text-sm bg-blue-600 text-white rounded shadow hover:bg-blue-700"
                                >
                                    Download PDF
                                </button>
                                <GenerateAudio selectedChapter={selectedChapter} courseId={course._id} moduleId={course.modules[openModuleIndex]._id} setSelectedChapter={setSelectedChapter} setCourse={setCourse} />
                            </div>


                            <div
                                className={`
                                overflow-hidden transition-all duration-500 ease-in-out
                                ${isVideo ? "max-h-[500px] opacity-100 translate-y-0" : "max-h-0 opacity-0 -translate-y-5"}
                            `}
                            >
                                <ChapterVideoPlayer isVideoLoading={isVideoLoading} selectedChapter={selectedChapter} />
                            </div>

                        </section>

                        <div
                            ref={pdfRef}
                            style={{
                                width: "100%",           // responsive width
                                maxWidth: "1000px",       // keeps it from being too wide on large screens
                                padding: "40px 20px",    // top/bottom + left/right padding
                                margin: "0 auto",        // center the container
                                backgroundColor: "#a6aebe",
                                color: "#000",
                                fontFamily: "Georgia, serif",
                                lineHeight: "1.6",
                                textAlign: "left",
                                boxSizing: "border-box", // include padding in width
                            }}
                        >

                            <ReactMarkdown
                                components={{
                                    h2: ({ node, ...props }) => <h2 className="markdown-h2" {...props} />,
                                    strong: ({ node, ...props }) => <h3 className="markdown-strong" {...props} />,
                                    p: ({ node, ...props }) => <p className="markdown-p" {...props} />,
                                    li: ({ node, ...props }) => <li className="markdown-li" {...props} />,
                                    pre: ({ node, ...props }) => <pre className="markdown-pre" {...props} />,
                                    code: ({ node, inline, children, ...props }) =>
                                        inline ? (
                                            <code className="markdown-code" {...props}>
                                                {children}
                                            </code>
                                        ) : (
                                            <pre className="markdown-pre" {...props}>
                                                <code>{children}</code>
                                            </pre>
                                        ),
                                }}
                            >
                                {displayedContent || "Content will appear here"}
                            </ReactMarkdown>
                        </div>

                        <footer className='flex  gap-2 justify-between items-center'>
                            {contentLines?.length > 20 && (
                                <button
                                    className="text-blue-500 mt-2  hover:underline"
                                    onClick={() => setExpanded(!expanded)}
                                >
                                    {expanded ? 'Read Less' : 'Read More...'}
                                </button>
                            )}
                            <button className='px-1 py-1 sm:px-4 sm:py-2 text-small border-blue-600 sm:text-sm bg-green-600 text-white rounded shadow hover:bg-green-700' onClick={handleMarkAsRead} >{selectedChapter?.isRead ? "completed" : "Mark as read"} </button>
                        </footer>

                        <button onClick={fetchChapterQuestions} className="px-1 py-1 sm:px-4 sm:py-2 text-small sm:text-sm bg-blue-600 text-white rounded shadow hover:bg-blue-700">Questions</button>
                        {
                            <div
                                className={`overflow-hidden  transition-all duration-500 ease-in-out
                                ${isQuestions ? "max-h-[1000px] opacity-100 translate-y-0" : "max-h-0 opacity-0 -translate-y-5"}
                                `}
                            >
                                <ChapterMcqs selectedChapter={selectedChapter} />
                            </div>

                        }


                    </div>
                }
            </div>


        </div>
    );
}

export default CoursePage;
