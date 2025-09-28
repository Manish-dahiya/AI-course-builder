const express = require("express");
const mongoose = require("mongoose");

const { GoogleGenerativeAI } = require("@google/generative-ai");
const Course = require("../models/course.model");
const ytSearch = require('yt-search');
const User = require("../models/user.model");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper: build structured prompt for Gemini
const buildPrompt = (topic) => `
You are a course generator AI.
Always output a JSON structure with:
{
  "courseName": "string",
  "modules": [
    {
      "title": "string",
      "chapters": [
        {"title": "string", "summary": "string",aiContent:"" }
      ]
    }
  ]
}

Topic: ${topic}
`;

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

    // ✅ Call Gemini only if it's a course request
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); //you can have a loop for different models if one rate-limits exceeds ,gemin-1.5 flash is one such.

    const result = await model.generateContent(buildPrompt(prompt));
    const text = result.response.text();

    //clean the data    
    const raw = text;
    const cleaned = raw.replace(/```json/g, "").replace(/```/g, "").trim();
    const courseData = JSON.parse(cleaned);


    // save the data to mongo db
    // for (let i = 0; i < courseData.modules.length; i++) {
    //   for (let j = 0; j < courseData.modules[i].chapters.length; j++) {

    //     courseData.modules[i].chapters[j].aiContent = "";
    //   }
    // }


    courseData.userPrompt = prompt;
    courseData.userId = userId
    const db_response = await Course.create(courseData);

    console.log("new course created:", db_response);


    const currUser = await User.findOne({ _id: userId });
    currUser.courses.push(db_response._id);
    await currUser.save();



    //response
    res.status(201).json({ coursePlan: db_response });

  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Something went wrong." });
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
    const models=["llama-3.1-8b-instant"  ,"llama-3.3-70b-versatile", "openai/gpt-oss-120b" ]

    
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

      console.log(`Chapter generated with ${model}:`, data.choices[0].message.content);
      return data.choices[0].message.content;

    } catch (err) {
      console.error(`Error with model ${model}:`, err);
    }
  }

  return ""; // nothing worked

   
}

async function getChapterContent(req, res) {

  const course = await Course.findById(req.body.courseId);
  if (!course) return res.status(404).json({ error: "Course not found" });

  const moduleIndex = course.modules.findIndex(mod => mod._id.toString() === req.body.moduleId);
  if (moduleIndex === -1) return res.status(404).json({ error: "module not found" });

  const chapterIndex = course.modules[moduleIndex].chapters.findIndex(ch => ch._id.toString() === req.body.chapterId);
  if (chapterIndex === -1) return res.status(404).json({ error: "Chapter not found" });

  const chapter = course.modules[moduleIndex].chapters[chapterIndex];


  if (chapter.aiContent.length > 0) {
    console.log("2:", chapter);
    return res.json({
      course
    });
  }

  // Otherwise, call AI to generate content
  const ai_Content = await chapterCall(course.title, course.modules[moduleIndex].title, course.modules[moduleIndex].chapters[chapterIndex].title, course?.userPrompt)
  chapter.aiContent = ai_Content;


  // Update the aiContent field in db
  course.modules[moduleIndex].chapters[chapterIndex].aiContent = ai_Content;
  await course.save();

  console.log("chapter content generated:", course.modules[moduleIndex].chapters[chapterIndex].aiContent);



  res.json({
    course
  });
}

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




module.exports = {
  generateCoursePlan,
  getChapterContent,
  getCourseById,
  // getAllCourses,
  getChapterVideo,
  deleteCourse
}