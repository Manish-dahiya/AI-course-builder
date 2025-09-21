import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import SideBar from '../components/SideBar';
import ReactMarkdown from 'react-markdown';
import ChapterSkeletonLoader from '../components/ChapterSkeletonLoader';


function CoursePage() {
    const { id } = useParams();
    const [course, setCourse] = useState(null);
    const [selectedChapter, setSelectedChapter] = useState({});
    const [showSidebar, setShowSidebar] = useState(true);
    const [expanded, setExpanded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);//for the loading of the chapter content 


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
                <SideBar course={course} fetchChapterContent={fetchChapterContent} setShowSidebar={setShowSidebar} showSidebar={showSidebar} />
            </div>

            <span onClick={() => setShowSidebar(!showSidebar)} className={`fixed top-0 left-0 z-20 h-full transition-transform duration-300 ease-in-out
            ${showSidebar ? 'translate-x-0' : '-translate-x-full'} sm:translate-x-0`} > &#9776; </span>

            {/* main content */}
            <div className='text-gray-300 sm:ml-54 md:ml-72  ' >
                {isLoading ? <ChapterSkeletonLoader /> :
                    <div>
                        <h1 className='font-bold  text-4xl '>{selectedChapter?.title || "No chapter selected"}</h1>
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
