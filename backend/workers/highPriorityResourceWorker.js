const Course = require("../models/course.model.js");
const { chapterCall } = require("../controllers/course.controller.js");


async function highPriorityWorker(channel) {
    const queueName = "high_priority_resources"; 

    // ✅ MUST assert queue BEFORE consuming
    await channel.assertQueue(queueName, { durable: true });

    console.log("✅ HighPriority worker started");

    channel.consume(queueName, async (msg) => {
        if (!msg) return;

        try {
            const job = JSON.parse(msg.content.toString());
            const { courseId, moduleId, chapterId, replyQueue } = job;

            const course = await Course.findById(courseId);
            if (!course) {
                console.error("❌ course not found:", courseId);
                channel.ack(msg);
                return;
            }

            const moduleIndex = course.modules.findIndex(mod => mod._id.toString() === moduleId);
            if (moduleIndex === -1) {
                console.error("❌ module not found:", moduleId);
                channel.ack(msg);
                return;
            }

            const chapterIndex = course.modules[moduleIndex].chapters.findIndex(ch => ch._id.toString() === chapterId);
            if (chapterIndex === -1) {
                console.error("❌ chapter not found:", chapterId);
                channel.ack(msg);
                return;
            }


            const chapter = course.modules[moduleIndex].chapters[chapterIndex];


            if (chapter.aiContent && chapter.aiContent.length > 0) {
                if (replyQueue) {
                    channel.sendToQueue(
                        replyQueue,
                        Buffer.from(JSON.stringify(course)),
                        { persistent: false }
                    );
                }
                channel.ack(msg); 
                return;
            }

            //otherwise generate the chapter content through ai
            const ai_Content = await chapterCall(course.title, course.modules[moduleIndex].title, course.modules[moduleIndex].chapters[chapterIndex].title, course?.userPrompt)
            chapter.aiContent = ai_Content;

            
            // Update the aiContent field in db
            course.modules[moduleIndex].chapters[chapterIndex].aiContent = ai_Content;
            await course.save();
            console.log("✅ Chapter content generated successfully for:", chapter.title);

             // --- SEND RESULT BACK TO REPLY QUEUE ---
            if (replyQueue) {
                channel.sendToQueue(
                    replyQueue,
                    Buffer.from(JSON.stringify(course)),
                    { persistent: false }
                );
            }

            channel.ack(msg);
        } catch (err) {
            console.error(" Error processing message:", err);
            channel.nack(msg, false, true);
        }

    }, { noAck: false });
}

module.exports = highPriorityWorker;