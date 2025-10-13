// components/LoadingScreen.jsx
// import React from "react";

// const LoadingScreen = () => {
//   const text = "promptCourse";

//   return (
//     <div className="w-full h-screen flex justify-center items-center bg-transparent">
//       <h1 className="text-5xl md:text-6xl font-semibold text-indigo-700 flex space-x-2">
//         {text.split("").map((letter, index) => (
//           <span
//             key={index}
//             className="inline-block animate-bounce"
//             style={{ animationDelay: `${index * 0.1}s` }}
//           >
//             {letter}
//           </span>
//         ))}
//       </h1>
//     </div>
//   );
// };

// export default LoadingScreen;

// components/LoadingScreen.jsx
// components/LoadingScreen.jsx


//--------------------------------------------loading bar animation-----------------------------------------
// import React from "react";

// const LoadingScreen = () => {
//   return (
//     <div className="w-full h-screen flex flex-col justify-center items-center">
//       {/* Website name just above the loading bar */}
//       <h1 className="text-4xl md:text-5xl font-semibold text-indigo-700 mb-6">
//         promptCourse
//       </h1>

//       {/* Loading bar */}
//       <div className="w-64 md:w-96 h-4 rounded-full overflow-hidden bg-gray-300">
//         <div className="h-full bg-indigo-700 animate-loading"></div>
//       </div>

//       {/* Tailwind custom animation */}
//       <style jsx>{`
//         @keyframes loading {
//           0% { width: 0%; }
//           100% { width: 100%; }
//         }
//         .animate-loading {
//           animation: loading 0.2s linear forwards;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default LoadingScreen;

//-------------------------------------------------------------
import React from "react";

const LoadingScreen = () => {
  return (
    <div className="w-full h-screen flex justify-center items-center bg-transparent">
      <div className="flex space-x-2">
        {[0, 1, 2].map((_, index) => (
          <span
            key={index}
            className="w-4 h-4 bg-indigo-700 rounded-full animate-dot-wave"
            style={{ animationDelay: `${index * 0.1}s` }}
          ></span>
        ))}
      </div>

      <style jsx>{`
        @keyframes dotWave {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }

        .animate-dot-wave {
          display: inline-block;
          animation: dotWave 0.2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
