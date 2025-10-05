require("dotenv").config();
const mongoose = require("mongoose");
const { connect } = require("../queues/index");


const startCourseWorker = require("./courseCreationWorker.js");
const lowPriorityWorker= require("./lowPriorityResourceWorker.js");
const highPriorityWorker= require("./highPriorityResourceWorker.js");


(async () => {
  try {
    // 1️ Connect MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Workers connected to MongoDB");

    // 2️ Connect RabbitMQ
    const channel = await connect();
    console.log("✅ Workers connected to RabbitMQ");

    // 3️ Start all workers (add more later easily)
    await Promise.all([
      startCourseWorker(channel),
      lowPriorityWorker(channel),
      highPriorityWorker(channel)
    ]);

  } catch (err) {
    console.error(" Worker startup failed:", err);
    process.exit(1);
  }
})();

