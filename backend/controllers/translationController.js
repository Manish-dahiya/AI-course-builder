// const Course = require("../models/course.model");
// const { v2: cloudinary } = require("cloudinary");
// const { GoogleGenerativeAI } = require("@google/generative-ai");

// const fs = require("fs");
// const path = require("path");

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


// cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// function getTranslationPrompt(text, language) {
//     switch (language) {
//         case "english":
//             return `translate the following text in english:\n\n ${text}`;
//         case "hindi":
//             return `Translate the following text into Hindi:\n\n${text}`;
//         case "hinglish":
//             return `Translate the following text into Hinglish (Latin script, mix Hindi + English naturally):\n\n${text}`;
//         default:
//             return text;
//     }
// }

// function getVoiceName(language) {
//     switch (language) {
//         case "english": return "en-IN-Wavenet-B";
//         case "hindi": return "hi-IN-Wavenet-A";
//         case "hinglish": return "hi-IN-Wavenet-A"; // Hinglish works with Hindi voice
//         default: return "en-IN-Wavenet-B";
//     }
// }

//  const generateChapterAudio = async (req,res) => {
//     try {
//         const { courseId, chapter, moduleId, audioLanguage } = req.body;
//         console.log("-------------------------------",courseId,chapter,moduleId,audioLanguage);
//         const currCourse =await  Course.findById(courseId);
//         const moduleIdx = currCourse.modules.findIndex((m)=>m._id.toString()===moduleId);
//         const chapterIdx = currCourse.modules[moduleIdx].chapters.findIndex((c)=>c._id.toString()===chapter._id);

//         const chapterText = chapter.aiContent; // AI-generated text

//         //translate text if needed
//         let translatedText = chapterText;
//         const prompt = getTranslationPrompt(translatedText, audioLanguage);
//         const translationResp = await genAI.generateContent(prompt);
//         translatedText = translationResp.response.text();

//         //generate TTS audio
//         const voice = getVoiceName(audioLanguage);
//         const ttsResp = await genAI.getGenerativeModel({ model: "models/tts-1" })
//             .generateContent({
//                 text: translatedText,
//                 voiceName: voice,
//                 audioConfig: { audioEncoding: "LINEAR16" }, // .wav
//             })

//         const buffer = Buffer.from(ttsResp.response.audioContent);

//         // Step 3: Write audio buffer to temp file
//          const tempDir = path.join(process.cwd(), "temp");
//         await fs.mkdir(tempDir, { recursive: true });
//         tempFilePath = path.join(tempDir, `chapter-${chapter._id}.wav`);
//         await fs.writeFile(tempFilePath, buffer);


//         const cloudResp = await cloudinary.uploader.upload(tempFilePath, {
//             resource_type: "video", // required for audio
//             folder: "course-audio",
//             public_id: `chapter-${chapter._Id}`,
//         })

//         //save url to db
//         currCourse.modules[moduleIdx].chapters[chapterIdx].audioUrl = cloudResp.secure_url;
//         await currCourse.save();

//         // Step 7: Delete temp file
//         fs.unlinkSync(tempFilePath);

//         // Step 8: Return URL to frontend
//         res.json({ audioUrl: cloudResp.secure_url, course: currCourse, chapter: currCourse.modules[moduleIdx].chapters[chapterIdx] });



//     }
//     catch (error) {
//         console.error(error);
//         res.status(500).json({ error: "Audio generation failed" });
//     }
// }

// module.exports={
//     generateChapterAudio,
// }

//--------------------------------------------------------with google cloud api-----------------------------------------------
// const Course = require("../models/course.model");
// const { v2: cloudinary } = require("cloudinary");
// const { GoogleGenerativeAI } = require("@google/generative-ai");
// const textToSpeech = require("@google-cloud/text-to-speech");
// const fs = require("fs").promises;
// const path = require("path");

// // Initialize Gemini and Google TTS
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// const ttsClient = new textToSpeech.TextToSpeechClient();

// // Configure Cloudinary
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// // Helper: translation prompt
// function getTranslationPrompt(text, language) {
//   switch (language) {
//     case "english": return `Translate the following text to English:\n\n${text}`;
//     case "hindi": return `Translate the following text to Hindi:\n\n${text}`;
//     case "hinglish": return `Translate the following text to Hinglish (Latin script, mix Hindi + English naturally):\n\n${text}`;
//     default: return text;
//   }
// }

// // Helper: TTS voice selection
// function getVoiceName(language) {
//   switch (language) {
//     case "english": return "en-IN-Wavenet-B";
//     case "hindi": return "hi-IN-Wavenet-A";
//     case "hinglish": return "hi-IN-Wavenet-A";
//     default: return "en-IN-Wavenet-B";
//   }
// }

// // Main controller
// const generateChapterAudio = async (req, res) => {
//   let tempFilePath = null;

//   try {
//     const { courseId, chapter, moduleId, audioLanguage } = req.body;

//     // 1️⃣ Fetch course & chapter
//     const course = await Course.findById(courseId);
//     if (!course) return res.status(404).json({ error: "Course not found" });

//     const moduleIdx = course.modules.findIndex(m => m._id.toString() === moduleId);
//     if (moduleIdx === -1) return res.status(404).json({ error: "Module not found" });

//     const chapterIdx = course.modules[moduleIdx].chapters.findIndex(c => c._id.toString() === chapter._id);
//     if (chapterIdx === -1) return res.status(404).json({ error: "Chapter not found" });

//     let text = chapter.aiContent;

//     // 2️⃣ Translate text if needed
//     if (audioLanguage !== "english") {
//       const prompt = getTranslationPrompt(text, audioLanguage);
//       const translationResp = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" }).generateContent(prompt);
//       text = translationResp.response.text();
//     }

//     // 3️⃣ Generate TTS audio using Google Cloud TTS
//     const [ttsResp] = await ttsClient.synthesizeSpeech({
//       input: { text },
//       voice: { languageCode: audioLanguage === "english" ? "en-IN" : "hi-IN", name: getVoiceName(audioLanguage) },
//       audioConfig: { audioEncoding: "MP3" },
//     });

//     // 4️⃣ Save audio temporarily
//     const tempDir = path.join(process.cwd(), "temp");
//     await fs.mkdir(tempDir, { recursive: true });
//     tempFilePath = path.join(tempDir, `chapter-${chapter._id}.mp3`);
//     await fs.writeFile(tempFilePath, ttsResp.audioContent, "binary");

//     // 5️⃣ Upload audio to Cloudinary
//     const cloudResp = await cloudinary.uploader.upload(tempFilePath, {
//       resource_type: "video", // Cloudinary treats audio as video
//       folder: "course-audio",
//       public_id: `chapter-${chapter._id}`,
//     });

//     // 6️⃣ Save audio URL in DB
//     course.modules[moduleIdx].chapters[chapterIdx].audioUrl = cloudResp.secure_url;
//     await course.save();

//     // 7️⃣ Return response
//     res.json({
//       audioUrl: cloudResp.secure_url,
//       course,
//       chapter: course.modules[moduleIdx].chapters[chapterIdx],
//     });

//   } catch (err) {
//     console.error("Audio generation error:", err);
//     res.status(500).json({ error: "Audio generation failed", details: err.message });
//   } finally {
//     // 8️⃣ Clean up temp file
//     if (tempFilePath) await fs.unlink(tempFilePath).catch(() => {});
//   }
// };

// module.exports = { generateChapterAudio };



// ---------------------------------------------with gtts package-----------------------------------------------
const Course = require("../models/course.model");
const { v2: cloudinary } = require("cloudinary");
const fs = require("fs").promises;
const path = require("path");
const gTTS = require("gtts"); // Free Google TTS
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Optional translation function
function getTranslationPrompt(text, language) {
  switch (language) {
    case "english": return `Translate the following text to English:\n\n${text}`;
    case "hindi": return `Translate the following text to Hindi:\n\n${text}`;
    case "hinglish": return `Translate the following text to Hinglish (Latin script, mix Hindi + English naturally):\n\n${text}`;
    case "chinese": return `Translate the following text to chinese :\n\n${text}`;
    case "tamil": return `Translate the following text to tamil :\n\n${text}`;
    default: return text;
  }
}

function getTTSLanguageCode(language) {
    switch (language.toLowerCase()) {
        case "english": return "en";
        case "hindi": return "hi";
        case "bengali": return "bn";
        case "gujarati": return "gu";
        case "kannada": return "kn";
        case "malayalam": return "ml";
        case "marathi": return "mr";
        case "tamil": return "ta";
        case "telugu": return "te";
        case "urdu": return "ur";

        // Punjabi fallback to Hindi
        case "punjabi": return "hi";

        default: return "en"; // fallback to English
    }
}
const generateChapterAudio = async (req, res) => {
    console.log("generating the audio file.....")
    let tempFilePath = null;

    try {
        const { courseId, chapter, moduleId, audioLanguage } = req.body;

        const currCourse = await Course.findById(courseId);
        if (!currCourse) return res.status(404).json({ error: "Course not found" });

        const moduleIdx = currCourse.modules.findIndex(m => m._id.toString() === moduleId);
        if (moduleIdx === -1) return res.status(404).json({ error: "Module not found" });

        const chapterIdx = currCourse.modules[moduleIdx].chapters.findIndex(c => c._id.toString() === chapter._id);
        if (chapterIdx === -1) return res.status(404).json({ error: "Chapter not found" });

        // Step 1: Get text (translation optional)
        const chapterText = chapter.aiContent;
        const prompt = getTranslationPrompt(chapterText, audioLanguage);

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(prompt);
        const translatedText = result.response.text();

        // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>Step 2: Generate audio with gTTS//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
        const langCode = getTTSLanguageCode(audioLanguage);
        const tts = new gTTS(translatedText, langCode,false); //false for normal speed, true for fast speed

        // Step 3: Save audio to temp file
        const tempDir = path.join(process.cwd(), "temp");
        await fs.mkdir(tempDir, { recursive: true });
        tempFilePath = path.join(tempDir, `chapter-${chapter._id}.mp3`);

        await new Promise((resolve, reject) => {
            tts.save(tempFilePath, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        // Step 4: Upload to Cloudinary
        const cloudResp = await cloudinary.uploader.upload(tempFilePath, {
            resource_type: "video", // required for audio
            folder: "course-audio",
            public_id: `chapter-${chapter._id}`,
        });

        // Step 5: Save URL in DB
        currCourse.modules[moduleIdx].chapters[chapterIdx].audioUrl = cloudResp.secure_url;
        currCourse.modules[moduleIdx].chapters[chapterIdx].audioLanguage = audioLanguage; //if the user has requested the audio in same language like prev request,then don't call this api
        await currCourse.save();

        // Step 6: Return response
        res.json({
            audioUrl: cloudResp.secure_url,
            course: currCourse,
            chapter: currCourse.modules[moduleIdx].chapters[chapterIdx]
        });

    } catch (err) {
        console.error("Audio generation error:", err);
        res.status(500).json({ error: "Audio generation failed", details: err.message });
    } finally {
        // Step 7: Cleanup temp file
        if (tempFilePath) {
            try { await fs.unlink(tempFilePath); }
            catch (unlinkErr) { console.error("Failed to delete temp file:", unlinkErr); }
        }
    }
};

module.exports = {
    generateChapterAudio
};





