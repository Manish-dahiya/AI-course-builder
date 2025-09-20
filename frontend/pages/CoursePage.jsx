import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import SideBar from '../components/SideBar';
import ReactMarkdown from 'react-markdown';
import ChapterSkeletonLoader from '../components/ChapterSkeletonLoader';


function CoursePage() {
    const { id } = useParams();
    const [course, setCourse] = useState(null);
    const [selectedChapter, setSelectedChapter] = useState({});
    const [showSidebar,setShowSidebar]= useState(true);
    const [expanded, setExpanded] = useState(false);
    const [isLoading,setIsLoading]= useState(false);//for the loading of the chapter content 


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
            }
        } catch (error) {
            console.log("Error fetching course:", error);
        }
    };

    //this will be called in sidebar 
    const fetchChapterContent=async(chapter,openModuleIndex,chapIndex)=>{
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
            console.log("hurrae", data.course.modules[openModuleIndex])

        }
        setIsLoading(false)    
    }


    useEffect(() => {
        fetchCourse();
    }, [id]);

    // useEffect(()=>{setSelectedChapter()  },[course])

    if (!course) return <div>Loading...</div>;


    return (
        <div className="flex h-screen">
            <div className={`fixed top-0 ${showSidebar?'block':'hidden'} sm:block left-5`} ><SideBar course={course} fetchChapterContent={fetchChapterContent} setShowSidebar={setShowSidebar}  showSidebar={showSidebar}/></div>
            { !showSidebar && <span onClick={()=>setShowSidebar(!showSidebar)} className='text-gray-50 font-bold me-2' > &#9776; </span>}
            {/* main content */}
            <div className='text-gray-300 sm:ml-52  ' >
                 

                <h1 className='font-bold  text-xl '>{selectedChapter?.title || "No chapter selected"}</h1>
                <ReactMarkdown components={{
                    h2: ({ node, ...props }) => (
                        <h2
                            className="text-blue-800 border-b border-gray-300 pb-1 my-3 mb-2"
                            {...props}
                        />
                    ),
                    strong: ({ node, ...props }) => (
                        <h3 className="text-indigo-800 mt-3 mb-1" {...props} />
                    ),
                    p: ({ node, ...props }) => (
                        <p className="text-left text-sm mx-2" {...props} />
                    ),
                    li: ({ node, ...props }) => (
                        <p className="text-left text-sm mx-2" {...props} />
                    ),
                    
                }}

                >{displayedContent || "Content will appear here"}</ReactMarkdown>

                {isLoading && <ChapterSkeletonLoader/>}

                {contentLines?.length > 20 && (
                    <button
                        className="text-blue-500 mt-2 hover:underline"
                        onClick={() => setExpanded(!expanded)}
                    >
                        {expanded ? 'Read Less' : 'Read More...'}
                    </button>
                )}


            </div>



        </div>
    );
}

export default CoursePage;
