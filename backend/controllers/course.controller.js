const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");

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
        {"title": "string", "content": "string"}
      ]
    }
  ]
}

Topic: ${topic}
`;

 async function generateCoursePlan (req, res){
  try {
    const { prompt } = req.body;

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
    

    //response
    res.json({ coursePlan: courseData });



  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong." });
  }
}

module.exports={
  generateCoursePlan
}