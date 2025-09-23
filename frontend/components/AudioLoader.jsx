import React from 'react'

function AudioLoader() {
    return (
        <div className='mt-3 loader-wrapper animate-fade-in'>
            <ul class="wave-menu">
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
            </ul>
            <p className='italic text-sm'>It may take 1-2 minutes to generate...</p>
        </div>

    )
}

export default AudioLoader
