import React, { useEffect, useState } from 'react'
import getEmbedUrl from "../src/utility/helper.js"
function ChapterVideoPlayer({ selectedChapter }) {
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsLoading(!isLoading);
        console.log(selectedChapter?.videoUrl);
    }, [selectedChapter])


    return (
        <div className="w-full h-full mt-3">
            {!isLoading && selectedChapter?.videoUrl!="" ? (
                <div
                    id="video-div"
                    className="bg-gray-900 h-64 sm:h-80 md:h-96 w-full rounded-lg shadow-lg"
                >
                    <iframe
                        width="100%"
                        height="400"
                        src={getEmbedUrl(selectedChapter?.videoUrl)}
                        title="Chapter Video"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="rounded-lg shadow-lg"
                    />
                </div>
            ) : (
                <div
                    id="video-skeleton"
                    className="animate-pulse bg-gray-700 h-64 sm:h-80 md:h-96 w-full   rounded-lg"
                >
                    {/* Optional inner placeholder elements */}
                    <div className="h-full w-full flex items-center justify-center text-gray-400">
                        Loading video...
                    </div>
                </div>
            )}
        </div>
    );
}


export default ChapterVideoPlayer
