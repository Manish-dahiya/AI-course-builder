const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Course= require("../models/course.model");


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
        {"title": "string", "summary": "string" "}
      ]
    }
  ]
}

Topic: ${topic}
`;

 async function generateCoursePlan (req, res){
  try {
    const  {prompt}  = req.body;

    console.log("yes",prompt); 

    if (!prompt.toLowerCase().includes("course")) {
      return res.json({
        message: "I am unable to do that, because I can only build courses.",
      });
    }

    // ✅ Call Gemini only if it's a course request
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(buildPrompt(prompt));
    const text = result.response.text();

    //clean the data    
    const raw = text;
    const cleaned = raw.replace(/```json/g, "").replace(/```/g, "").trim();
    const courseData = JSON.parse(cleaned);
    

    //save the data to mongo db
    for(let i=0;i<courseData.modules.length;i++){
        for(let j=0;j<courseData.modules[i].chapters.length;j++){
            courseData.modules[i].chapters[j].aiContent="";
        }
    }

    const db_response=await Course.create(courseData);
    console.log(db_response);

    //response
    res.json({ coursePlan: courseData });



  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong." });
  }
}


async function chapterCall(courseTitle,moduleTitle,chapterTitle){
  try{
       const prompt = `
        You are an expert educator. 
        Write a **detailed, easy-to-understand explanation** for the chapter titled "${chapterTitle}" 
        from the module "${moduleTitle}" of the course "${courseTitle}".
        Make sure the content is **long enough to cover a full page** and explains the topic thoroughly, 
        including examples if necessary, step-by-step explanations, and practical insights for the user.
        `;

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        return text;
  }
  catch(error){

  }
}

async function getChapterContent(req,res){

  const course = await Course.findById(req.body.courseId);
  if (!course) return res.status(404).json({ error: "Course not found" });

  const moduleIndex = course.modules.findIndex(mod => mod._id.toString() === req.body.moduleId);
  if (moduleIndex === -1) return res.status(404).json({ error: "module not found" });

  const chapterIndex = course.modules[moduleIndex].chapters.findIndex(ch => ch._id.toString() === req.body.chapterId);
  if (chapterIndex === -1) return res.status(404).json({ error: "Chapter not found" });

  const chapter = course.modules[moduleIndex].chapters[chapterIndex];

  if(chapter.aiContent.length>0){
           return res.json({ 
            course
        });
  }

  // Otherwise, call AI to generate content
  const aiContent = await chapterCall(course.title,course.modules[moduleIndex].title,course.modules[moduleIndex].chapters[chapterIndex].title)
  chapter.aiContent = aiContent;

  // Update the aiContent field in db
  course.modules[moduleIndex].chapters[chapterIndex].aiContent = aiContent;
  await course.save();


// 
  // Return the chapter info including index
    res.json({ 
       course
    });  
}

async function getCourseById(req,res){
  const {id}= req.params;

  const currentCourse= await Course.findById(id);

  if(!currentCourse){
    return res.json({"coursePlan":"no course found with current id"});

  }

  console.log(currentCourse);
  return res.json({"coursePlan":currentCourse});
}

async function getAllCourses(req,res){
  const allCourses= await Course.find(); //<--fetches all courses from the database and returns an array
  return res.json({"allCourses":allCourses});
}

module.exports={
  generateCoursePlan,
  getChapterContent,
  getCourseById,
  getAllCourses
}