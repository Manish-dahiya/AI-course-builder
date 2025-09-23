import React, { useState } from 'react'
import { API_BASE_URL } from '../src/utility/helper';
import { useEffect } from 'react';
import AudioLoader from './AudioLoader';

function GenerateAudio({ courseId, selectedChapter, moduleId, setSelectedChapter, setCourse }) {
    const [audioLanguage, setAudioLanguage] = useState("");
    const [isAudioLoading, setIsAudioLoading] = useState(false);
    const [audioUrl, setAudioUrl] = useState("");

    const handleGenerateAudio = async () => {
        //call api
        //courseId,chapter,moduleId,audioLanguage
        if (audioLanguage == "") {
            alert("please select the audio language first");
            return;
        }

        if (selectedChapter.audioUrl == "" || selectedChapter.audioLanguage != audioLanguage) {
            setIsAudioLoading(true);
            const res = await fetch(`${API_BASE_URL}/api/courses/chapter/get-chapter-audio`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ "courseId": courseId, "chapter": selectedChapter, "moduleId": moduleId, "audioLanguage": audioLanguage })
            })
            if (res.ok) {
                const data = await res.json();
                setAudioUrl(data.audioUrl);
                setSelectedChapter(data.chapter);
                setCourse(data.course);

                downloadAudio(data.audioUrl);

            }
            else console.log("response is not ok.May be try in a while..")
            setIsAudioLoading(false);
        }
        else {
            setAudioUrl(selectedChapter?.audioUrl);
            downloadAudio(selectedChapter?.audioUrl)
        }
    }

    const downloadAudio = (url) => {
        //download the audio for the user as soon as server provides the url
        const a = document.createElement('a');
        a.href = `${url}?dl=1`;
        a.download = `${`chapter-${url}`}.mp3`;
        a.target = "_blank"; // <-- open in new tab
        document.body.appendChild(a);
        a.click();

        document.body.removeChild(a);
    }


    const handleAudioChange = (e) => {
        setAudioLanguage(e.target.value)
        console.log(audioLanguage);
    }
    return (
        <div className='flex gap-3'>
            {!isAudioLoading
                ? <>
                    <select className='bg-[#161d29] text-small  p-1 sm:p-2  border border-white text-white' value={audioLanguage} onChange={handleAudioChange} >
                        <option value="" disabled>select Audio language</option>
                        <option value="english">English </option>
                        <option value="hindi">Hindi</option>
                        <option value="hinglish">Hinglish </option>
                        <option value="tamil">tamil </option>
                    </select>

                    <button className=' text-small sm:p-2 px-1 bg-[#a6aebe] text-black hover:scale-95 transform transition duration-200 ease-in-out rounded ' onClick={handleGenerateAudio} >Generate Audio for Chapter</button>
                </>
                : <AudioLoader />

            }

        </div>
    )
}

export default GenerateAudio
