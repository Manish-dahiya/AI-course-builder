const express = require("express");
const mongoose = require("mongoose");

const { GoogleGenerativeAI } = require("@google/generative-ai");
const Course = require("../models/course.model");
const ytSearch = require('yt-search');
const User = require("../models/user.model");
const { getChannel } = require("../queues");
const { getIo } = require("../socket.js");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helperw: build structured prompt for Gemini
// const buildPrompt = (topic) => `
// You are a course generator AI.
// Always output a JSON structure with:
// {
//   "courseName": "string",
//   "modules": [
//     {
//       "title": "string",
//       "chapters": [
//         {"title": "string", "summary": "string",aiContent:"" }
//       ]
//     }
//   ]
// }

// Topic: ${topic}
// `;




async function generateCoursePlan(req, res) {
  try {
    let { prompt, userId } = req.body;

    // If guest, assign default guest user ID
    const GUEST_USER_ID = "68d79e6dbd0ea980a92e5b6f";
    if (!userId || userId === "guestId") {
      userId = GUEST_USER_ID;
    }
    userId = new mongoose.Types.ObjectId(userId);



    if (!prompt.toLowerCase().includes("course")) {
      return res.json({
        message: "I am unable to do that, because I can only build courses.",
      });
    }

    // --- CREATE A TEMPORARY REPLY QUEUE ---
    const replyQueue = `course_reply_${Date.now()}`;
    const channel = getChannel();
    await channel.assertQueue(replyQueue, { exclusive: true });

    // Consume the reply queue for the result
    channel.consume(
      replyQueue,
      msg => {
        if (msg !== null) {
          const result = JSON.parse(msg.content.toString());
          res.status(201).json({ coursePlan: result });
          channel.deleteQueue(replyQueue); // cleanup
        }
      },
      { noAck: true }
    );

    // --- SEND JOB TO course_creation QUEUE ---
    const jobData = {
      prompt,
      userId: userId.toString(),
      replyQueue,
    };

    channel.sendToQueue(
      "course_creation",
      Buffer.from(JSON.stringify(jobData)),
      { persistent: true }
    );

  } catch (error) {
    console.error(error);
    res.status(400).json({ error });
  }
}

async function chapterCall(courseTitle, moduleTitle, chapterTitle, userPrompt = "") {

  const prompt = `
      You are an expert educator. 
      Write a **detailed, easy-to-understand explanation** for the chapter titled "${chapterTitle}" 
      from the module "${moduleTitle}" of the course "${courseTitle}".
      The course was originally requested as: "${userPrompt}".

      Make sure to follow the language/style/tone based on the user request.
    If they asked for Hinglish, write in Hinglish. If Hindi, use Hindi. If English, use English.

      Make sure the content is **long enough to cover a full page** and explains the topic thoroughly, 
      including examples if necessary, step-by-step explanations, and practical insights for the user.
      `;


  console.log("generating chapter content.....")
  const models = ["llama-3.1-8b-instant", "llama-3.3-70b-versatile", "openai/gpt-oss-120b"]


  for (let model of models) {
    try {
      console.log(`Trying model: ${model}`);

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "messages": [
            { "role": "user", "content": prompt }
          ],
          "model": model,
          "max_tokens": 1500
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error(`Error with model ${model}:`, data);

        // ✅ Switch model only if rate-limit error
        if (data?.error?.code === "rate_limit_exceeded") {
          console.warn(`Rate limit hit on ${model}, switching to next model...`);
          continue;
        }

        // ❌ Other errors → stop
        return "";
      }

      return data.choices[0].message.content;

    } catch (err) {
      console.error(`Error with model ${model}:`, err);
    }
  }

  return ""; // nothing worked


}

async function getChapterContent(req, res) {
 try {
   const { courseId ,moduleId,chapterId} = req.body;
  
  //-----------------push the job to the high_priority_resource queue-------------------------
  const replyQueue = `chapter_reply_${Date.now()}`;
  const channel = getChannel();
  await channel.assertQueue(replyQueue, { exclusive: true });

  // Consume the reply queue for the result
  channel.consume(
    replyQueue,
    msg => {
      if (msg !== null) {
        const result = JSON.parse(msg.content.toString());
        channel.deleteQueue(replyQueue); // cleanup
        return res.json({ course: result });
      }
    },
    { noAck: true }
  );

  const job = {
    courseId,
    moduleId,
    chapterId,
    replyQueue
  };

  channel.sendToQueue(
    "high_priority_resources",
    Buffer.from(JSON.stringify(job)),
    { persistent: true }
  );

  console.log("Chapter generation job queued");
 } catch (error) {
     console.error(error);
    return res.status(400).json({ error });
 }
}


const notifyCourseReady = async (req, res) => {
  const { userId, courseId } = req.body;
  const io = getIo();

  console.log(`🔔 Received notification: Course ${courseId} ready for user ${userId}`);

  // Check if room exists
  const room = io.sockets.adapter.rooms.get(userId);
  console.log(`📊 Room ${userId} has ${room?.size || 0} connected clients`);

  if (!room || room.size === 0) {
    console.log(`⚠️ WARNING: No clients in room ${userId}`);
  }

  // Emit event
  io.to(userId).emit("courseReady", { courseId });
  console.log(`✉️ Emitted courseReady event to room ${userId}`);

  res.json({ message: "Notification sent" });
};



async function getCourseById(req, res) {
  const { id } = req.params;

  const currentCourse = await Course.findById(id);

  if (!currentCourse) {
    return res.json({ "coursePlan": "no course found with current id" });

  }

  console.log("find call returned data:", currentCourse);
  return res.json({ "coursePlan": currentCourse });
}

// async function getAllCourses(req,res){
//   const {userId}= req.params
//   const allCourses= await User.findById(userId); //<--fetches all courses from the database and returns an array
//   return res.json({"allCourses":allCourses});
// }

async function getChapterVideo(req, res) {
  const { courseId, moduleIndex, chapterId } = req.body;
  if (!courseId || moduleIndex === undefined || !chapterId) {
    // if(!courseId)console.log("ab courseId ke kya hogaya");
    // if(moduleIndex==undefined)console.log("ab moduleIndex ke kya hogaya");
    // if(!chapterId)console.log("ab chapterId ke kya hogaya");
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // fetch real course doc from db
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ error: "Course not found" });

    const chapIndex = course.modules[moduleIndex].chapters.findIndex(
      ch => ch._id.toString() === chapterId
    );
    if (chapIndex === -1) return res.status(404).json({ error: "Chapter not found" });

    const query = course.modules[moduleIndex].chapters[chapIndex].title;
    const searchResult = await ytSearch(query);
    const video = searchResult.videos[0];
    if (!video) return res.status(404).json({ error: "No video found" });

    // save video url
    course.modules[moduleIndex].chapters[chapIndex].videoUrl = video.url;
    await course.save();

    console.log("youtube video search successful ")
    res.json({
      course,
      chapter: course.modules[moduleIndex].chapters[chapIndex]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "failed to fetch video" });
  }
}

async function deleteCourse(req, res) {
  const { id } = req.params
  try {
    const courseToDelete = await Course.findById(id);

    // 🗑️ Delete the course
    await Course.findByIdAndDelete(id);

    if (courseToDelete?.userId) {
      await User.findByIdAndUpdate(
        courseToDelete.userId,
        { $pull: { courses: courseToDelete._id } }, // remove from array
        { new: true }
      );
    }

    console.log("course deleted successfully");
    return res.status(200).json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("Error deleting course:", error);
    return res.status(500).json({ error: "Server error" });
  }


}

async function markChapterRead(req, res) {
  const { chapterId } = req.params
  try {
    const course = await Course.findOne({ "modules.chapters._id": chapterId });

    let chapterFound = null;

    // Loop modules and chapters
    course.modules.forEach(module => {
      const chapter = module.chapters.id(chapterId); // mongoose shortcut
      if (chapter) {  // nothing but array filter logic
        chapter.isRead = chapter.isRead ? false : true;
        chapterFound = chapter;
      }
    });

    await course.save();

    return res.json({ "message": "chapter marked successfully" });

  } catch (error) {
    console.log("error in marking chapter read", error)
  }
}


async function getChapterQuestions(req, res) {
  const { chapterId } = req.params;

  console.log("fetching chapter questions....")

  const course = await Course.findOne({ "modules.chapters._id": chapterId });

  if (!course) {
    return res.json({ "message": "there is no course", "id": chapterId });
  }

  let chapterFound = null;

  // Loop modules and chapters
  course.modules.forEach(module => {
    const chapter = module.chapters.id(chapterId); // mongoose shortcut
    if (chapter) {  // nothing but array filter logic
      chapterFound = chapter;
    }
  });
  const chapterContent = chapterFound.aiContent
  const prompt = `
You are an expert educator.

Read the following chapter content and generate 5 multiple-choice questions from it.

Chapter Content:
"""
${chapterContent}
"""

Output a valid JSON object in this format:

{
  "mcq": [
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "answerIndex": number // 0-based index of the correct option
    }
  ]
}

Rules:
- Only return valid JSON, nothing else.
- Preserve the meaning of the chapter content.
- Ensure the correct answerIndex corresponds to the right option.
- Options must be non-trivial and plausible.

`;

  //---------------------------------------------------------------
  const models = ["llama-3.1-8b-instant", "llama-3.3-70b-versatile", "openai/gpt-oss-120b"]


  for (let model of models) {
    try {
      console.log(`Trying model: ${model}`);

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "messages": [
            { "role": "user", "content": prompt }
          ],
          "model": model,
          "max_tokens": 1500
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error(`Error with model ${model}:`, data);

        //  Switch model only if rate-limit error
        if (data?.error?.code === "rate_limit_exceeded") {
          console.warn(`Rate limit hit on ${model}, switching to next model...`);
          continue;
        }

        //  Other errors → stop
        return "";
      }

      const raw = data.choices[0].message.content;
      const cleaned = raw.replace(/```json/g, "").replace(/```/g, "").trim();
      const mcqData = JSON.parse(cleaned);

      console.log("data is:", mcqData);

      //save the questions to db as well-------------------------------------------
      course.modules.forEach(module => {
        const chapter = module.chapters.id(chapterId); // mongoose shortcut
        if (chapter) {  // nothing but array filter logic
          chapter.questions = mcqData.mcq
          chapterFound = chapter; // update ref to updated one
        }
      });

      await course.save();
      //-----------------------------------------------------
      return res.json({ course, "chapter": chapterFound });

    } catch (err) {
      console.error(`Error with model ${model}:`, err);
    }
  }
}


module.exports = {
  generateCoursePlan,
  getChapterContent,
  chapterCall,
  notifyCourseReady,

  getCourseById,
  // getAllCourses,
  getChapterVideo,
  deleteCourse,
  markChapterRead,
  getChapterQuestions
}