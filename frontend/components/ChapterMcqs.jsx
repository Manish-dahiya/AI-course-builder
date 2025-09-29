import React, { useState } from "react";

const selectedChapter = {
  mcq: [
    {
      question:
        "What is the main area where you'll be working on your image in Photoshop?",
      options: ["Workspace", "Toolbar", "Panel Bar", "Menu Bar"],
      answerIndex: 0,
    },
    {
      question:
        "To navigate the workspace efficiently, which shortcut can you use to switch between different panels?",
      options: ["Ctrl+A", "Ctrl+Tab", "Ctrl+0", "Ctrl+S"],
      answerIndex: 1,
    },
    {
      question: "Which panel allows you to manage your image's layers?",
      options: ["Layers Panel", "Properties Panel", "Toolbar", "Menu Bar"],
      answerIndex: 0,
    },
    {
      question: "What is the purpose of the **Toolbar** in Photoshop?",
      options: [
        "To adjust image size and resolution",
        "To select and manage layers",
        "To perform essential tools and actions for editing your image",
        "To navigate between different panels",
      ],
      answerIndex: 2,
    },
    {
      question: "What does the shortcut **Ctrl+A** do in Photoshop?",
      options: [
        "Reset the toolbar to its default state",
        "Select all layers in the Layers panel",
        "Switch between different panels",
        "Save an image in different format",
      ],
      answerIndex: 1,
    },
  ],
};

function ChapterMcqs() {
    const [answers,setAnswers]= useState([])
    const handleOptionClick=(qidx,opIdx)=>{
        setAnswers((prev)=> ({...prev,[qidx]:opIdx}))
    }

  return (
    <div className="w-full min-h-96 p-2 sm:p-6 bg-[#a6aebe] text-black text-start rounded">
      <h2 className="markdown-h2 text-center">Questions</h2>
      {selectedChapter?.mcq &&
        selectedChapter.mcq.map((m, qidx) => (
          <div key={qidx} className="mb-4">
            <p className="markdown-p font-semibold">Q{qidx + 1}. {m.question}</p>
            <ul>
              {m.options.map((option, opIdx) => (
                <li
                  key={opIdx}
                  className={`markdown-li border border-blue-600 rounded p-1 sm:p-2 my-1 bg-[#a0a6b4] cursor-pointer
                    ${answers[qidx]!==undefined? opIdx==m.answerIndex ? "border-green-600  bg-green-700 "  :"border-red-600"  :""}
                  `}
                  onClick={()=>handleOptionClick(qidx,opIdx)}
                >
                  ◉ {option}
                </li>
              ))}
            </ul>
          </div>
        ))}
    </div>
  );
}

export default ChapterMcqs;
