import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import SideBar from '../components/SideBar';
import ReactMarkdown from 'react-markdown';
import ChapterSkeletonLoader from '../components/ChapterSkeletonLoader';
import ChapterVideoPlayer from '../components/ChapterVideoPlayer';


function CoursePage() {
    const { id } = useParams();
    //can be moved to context
    const [course, setCourse] = useState(null);
    const [selectedChapter, setSelectedChapter] = useState({});
    const [openModuleIndex, setOpenModuleIndex] = useState(0);

    const [showSidebar, setShowSidebar] = useState(true);
    const [expanded, setExpanded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);//for the loading of the chapter content 
    const [isVideo, setIsVideo] = useState(false);


    //-------------- Split content by line breaks
    const contentLines = selectedChapter?.aiContent?.split('\n');

    const displayedContent = expanded
        ? contentLines?.join('\n') // show all
        : contentLines?.slice(0, 20).join('\n'); // show first N lines

    //-------


    const fetchCourse = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/courses/${id}`);
            if (res.ok) {
                const data = await res.json();
                setCourse(data.coursePlan);
                setSelectedChapter(data.coursePlan.modules[0].chapters[0]);

                setSelectedChapter(data.coursePlan.modules[0].chapters[0]);

            }
        } catch (error) {
            console.log("Error fetching course:", error);
        }
    };

    //this will be called in sidebar 
    const fetchChapterContent = async (chapter, openModuleIndex, chapIndex) => {
        setSelectedChapter(chapter);
        setIsLoading(true)
        if (chapter.aiContent.length == 0) {
            //over here you have to make an api call to generate the content of this chapter
            const res = await fetch("http://localhost:5000/api/courses/chapter", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ "courseId": course._id, "moduleId": course.modules[openModuleIndex]._id, "chapterId": chapter._id })
            })

            const data = await res.json();
            setSelectedChapter(data.course.modules[openModuleIndex].chapters[chapIndex]);
            setCourse(data.course)
        }
        setIsLoading(false)
    }

    const fetchChapterVideo = async () => {
        console.log(openModuleIndex)

        if (selectedChapter?.videoUrl == "") {
            const res = await fetch('http://localhost:5000/api/courses/chapter/get-chapter-video', {
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
    }

    const handleVideoButtonClick = () => {
        setIsVideo(!isVideo);
        if (isVideo == true) fetchChapterVideo();
    }


    useEffect(() => {
        fetchCourse();
    }, [id]);


    if (!course) return <div>Loading...</div>;


    return (
        <div className="flex h-screen ">
            <div
                className={`fixed top-0 left-0 z-20 h-full transition-transform duration-300 ease-in-out
            ${showSidebar ? 'translate-x-0' : '-translate-x-full'} sm:translate-x-0`}
            >
                <SideBar openModuleIndex={openModuleIndex} setOpenModuleIndex={setOpenModuleIndex} course={course} fetchChapterContent={fetchChapterContent} setShowSidebar={setShowSidebar} showSidebar={showSidebar} />
            </div>

            <span onClick={() => setShowSidebar(!showSidebar)} className={`text-white font-bold text-2xl cursor-pointer`} > &#9776; </span>

            {/* main content */}
            <div className='text-gray-300 sm:ml-54 md:ml-72  ' >

                {isLoading ? <ChapterSkeletonLoader /> :
                    <div>
                        <h1 className='font-bold  text-4xl mb-3 '>{selectedChapter?.title || "No chapter selected"}</h1>

                        {/* youtube video functionality */}
                        <section id="youtube-video-section" className="w-full">
                            <button
                                className="flex items-center px-4 py-2 bg-[#ff0033] hover:bg-blue-900 text-white font-semibold rounded-md transition-colors duration-300"
                                onClick={handleVideoButtonClick}
                            >
                                Video
                            </button>
                            <div
                                className={`
                                overflow-hidden transition-all duration-500 ease-in-out
                                ${isVideo ? "max-h-[500px] opacity-100 translate-y-0" : "max-h-0 opacity-0 -translate-y-5"}
                            `}
                            >
                                <ChapterVideoPlayer selectedChapter={selectedChapter} />
                            </div>
                        </section>




                        <ReactMarkdown
                            components={{
                                h2: ({ node, ...props }) => (
                                    <h2
                                        className="text-blue-800 text-3xl text-left border-b border-gray-300 pb-1 mt-5 mb-2"
                                        {...props}
                                    />
                                ),

                                strong: ({ node, ...props }) => (
                                    <h3 className="text-indigo-800 text-3xl mt-4 mb-2" {...props} />
                                ),
                                p: ({ node, ...props }) => (
                                    <p className="text-left text-xl my-2" {...props} />
                                ),
                                li: ({ node, ...props }) => (
                                    <li className="text-left text-xl" {...props} />
                                ),
                                // Code blocks
                                pre: ({ node, ...props }) => (
                                    <pre className="text-left bg-gray-800 p-4 rounded overflow-x-auto my-4" {...props} />
                                ),
                                code: ({ node, inline, className, children, ...props }) => {
                                    if (inline) {
                                        // inline code
                                        return (
                                            <code className="bg-gray-700 px-1 py-0.5 rounded" {...props}>
                                                {children}
                                            </code>
                                        );
                                    } else {
                                        // code block (inside <pre>)
                                        return (
                                            <pre
                                                className="bg-gray-800 p-2 rounded my-2 overflow-x-auto text-left whitespace-pre-wrap"
                                                {...props}
                                            >
                                                <code>{children}</code>
                                            </pre>
                                        );
                                    }
                                },
                            }}
                        >
                            {displayedContent || "Content will appear here"}
                        </ReactMarkdown>



                        {contentLines?.length > 20 && (
                            <button
                                className="text-blue-500 mt-2 hover:underline"
                                onClick={() => setExpanded(!expanded)}
                            >
                                {expanded ? 'Read Less' : 'Read More...'}
                            </button>
                        )}

                    </div>

                }
            </div>



        </div>
    );
}

export default CoursePage;
