import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import SideBar from '../components/SideBar';
import ReactMarkdown from 'react-markdown';


function CoursePage() {
    const { id } = useParams();
    const [course, setCourse] = useState(null);
    const [selectedChapter, setSelectedChapter] = useState({});

    const [expanded, setExpanded] = useState(false);

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


    useEffect(() => {
        fetchCourse();
    }, [id]);

    if (!course) return <div>Loading...</div>;

    return (
        <div className="flex h-screen">
            <div className='fixed top-5 left-5' ><SideBar courseData={course} setSelectedChapter={setSelectedChapter} /></div>

            {/* main content */}
            <div className='text-gray-300 ml-52  ' >

                <h1 className='font-bold text-xl '>{selectedChapter?.title || "No chapter selected"}</h1>
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
                        <p className="text-left mx-2" {...props} />
                    ),
                }}

                >{displayedContent || "Content will appear here"}</ReactMarkdown>

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
