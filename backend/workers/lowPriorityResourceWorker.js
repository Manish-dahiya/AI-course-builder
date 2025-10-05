const Course = require("../models/course.model.js");
const { chapterCall } = require("../controllers/course.controller.js");
const axios = require("axios"); 


async function lowPriorityWorker(channel) {
    const queueName = "low_priority_resources"; // Use consistent queue name

    // ✅ MUST assert queue BEFORE consuming
    await channel.assertQueue(queueName, { durable: true });

    console.log("✅ LowPriority worker started and waiting for background jobs...");

    channel.consume(queueName, async (msg) => {
        if (!msg) return;

        try {
            const { courseId, userId } = JSON.parse(msg.content.toString());

            console.log(`📥 Starting background chapter generation for course: ${courseId}`);

            const course = await Course.findById(courseId);
            if (!course) {
                console.error("❌ Course not found:", courseId);
                channel.ack(msg);
                return;
            }

            for (let mod of course.modules) {
                for (let chap of mod.chapters) {
                    if (!chap.aiContent || chap.aiContent.trim() === "") {
                        console.log(`📝 Generating chapter: ${chap.title}`);
                        const aiContent = await chapterCall(course.title, mod.title, chap.title, course.userPrompt);
                        chap.aiContent = aiContent;
                        await course.save();
                    }
                }
            }

            console.log(`✅ Finished generating all chapters for course ${courseId}`);

            //tell the backend so that ,it can emmit the event
             try {
                await axios.post(`http://localhost:5000/api/courses/notify-ready`, {
                    userId,
                    courseId
                });
                console.log(`🔔 User ${userId} notified successfully`);
            } catch (fetchError) {
                console.error("⚠️ Failed to notify user:", fetchError.message);
                // Chapters are still saved, just notification failed
            }

            channel.ack(msg);

        } catch (err) {
            console.error("❌ Error processing message:", err);
            // Requeue the message on error 
            channel.nack(msg, false, true);
        }

    }, { noAck: false });
}

module.exports = lowPriorityWorker;