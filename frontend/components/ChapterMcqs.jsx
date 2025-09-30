import React, { useState } from "react";



function ChapterMcqs({selectedChapter}) {
  const [answers, setAnswers] = useState([])
  const handleOptionClick = (qidx, opIdx) => {
    setAnswers((prev) => ({ ...prev, [qidx]: opIdx }))
  }

  return (
    <>
      {selectedChapter?.questions ?
        <div className="w-full min-h-96 p-2 sm:p-6 bg-[#a6aebe] text-black text-start rounded">
          <h2 className="markdown-h2 text-center">Questions</h2>
          {selectedChapter?.questions &&
            selectedChapter.questions.map((m, qidx) => (
              <div key={qidx} className="mb-4">
                <p className="markdown-p font-semibold">Q{qidx + 1}. {m.question}</p>
                <ul>
                  {m.options.map((option, opIdx) => (
                    <li
                      key={opIdx}
                      className={`markdown-li border border-blue-600 rounded p-1 sm:p-2 my-1 bg-[#a0a6b4] cursor-pointer
                    ${answers[qidx] !== undefined ? opIdx == m.answerIndex ? "border-green-600  bg-green-700 " : "border-red-600" : ""}
                  `}
                      onClick={() => handleOptionClick(qidx, opIdx)}
                    >
                      ◉ {option}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        </div>
        :
        <div className="w-full min-h-96 p-2 sm:p-6 bg-[#a6aebe] text-black text-start rounded animate-pulse">
          <div className="h-8 sm:h-10 w-1/3 bg-gray-400 rounded mx-auto mb-6"></div>

          {[...Array(3)].map((_, qidx) => (
            <div key={qidx} className="mb-6">
              {/* Question */}
              <div className="h-8 w-2/3 bg-gray-500 rounded mb-3"></div>

              {/* Options */}
              <ul>
                {[...Array(4)].map((_, opIdx) => (
                  <li
                    key={opIdx}
                    className="h-8 ms-6 w-full sm:w-4/5 bg-gray-400 rounded my-2"
                  ></li>
                ))}
              </ul>
            </div>
          ))}
        </div>

      }

    </>
  );
}

export default ChapterMcqs;
