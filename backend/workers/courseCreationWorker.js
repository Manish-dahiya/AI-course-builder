const mongoose = require("mongoose");
const Course = require("../models/course.model");
const User = require("../models/user.model");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// ✅ Initialize Gemini HERE in the worker
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


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
  ]w
}

Topic: ${topic}
`;


async function startCourseWorker(channel) {
    // await mongoose.connect(process.env.MONGO_URI);
    // console.log("Worker connected to MongoDB ✅");


    channel.consume("course_creation", async msg => {
        try {
            const { prompt, userId, replyQueue } = JSON.parse(msg.content.toString());
            console.log("Processing course creation job for user:", userId);

            console.log("generating");
            // Call Gemini only if it's a course request
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); //you can have a loop for different models if one rate-limits exceeds ,gemin-1.5 flash is one such.

            const result = await model.generateContent(buildPrompt(prompt));
            const text = result.response.text();

            //clean the data    
            const raw = text;
            const cleaned = raw.replace(/```json/g, "").replace(/```/g, "").trim();
            const courseData = JSON.parse(cleaned);

            courseData.userPrompt = prompt;
            courseData.userId = userId
            const db_response = await Course.create(courseData);

            console.log("new course created:", db_response);


            const currUser = await User.findOne({ _id: userId });
            currUser.courses.push(db_response._id);
            await currUser.save();

            //------------------------------push it in lowPriority queue.-----------------------------------------------
            await channel.sendToQueue('low_priority_resources', Buffer.from(JSON.stringify({
                courseId: db_response._id,
                userId: userId,  // if you want to notify later
            })));




            // --- SEND BACK RESULT TO REPLY QUEUE ---
            channel.sendToQueue(replyQueue, Buffer.from(JSON.stringify(db_response)));

            channel.ack(msg);
            console.log("Course job processed successfully for user:", userId);

        } catch (err) {
            console.error("Error processing course creation job:", err);
            channel.ack(msg); // still ack to prevent stuck messages
        }
    });

    console.log("Course worker started and listening for jobs...");
}

module.exports = startCourseWorker;
