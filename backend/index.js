const express=require("express");

const app=express();
const dotenv=require("dotenv")
const cors=require("cors")
const morgan = require("morgan"); //<-------------------testing 
const { connect } = require("./queues/index.js"); 


app.use(cors({
  origin: "*",   //<----------------------- or explicitly "http://192.168.31.36:5173"
  methods: ["GET", "POST", "PUT", "DELETE"]
}));


dotenv.config();
const port=process.env.PORT

const db=require("./dbConfig/dbConfig.js");
app.use(express.json())
app.use(morgan("dev")); // <---------------------for testing>


const courseRoutes = require("./routes/course.routes.js");
const userRoutes= require("./routes/user.routes.js");
app.use("/api/courses", courseRoutes);
app.use("/api/users", userRoutes);

async function startServer() {
    try {
        // Connect to RabbitMQ first
        await connect();

        // Start Express server
        app.listen(port, () => console.log("Server running on port 5000"));
    } catch (err) {
        console.error("Failed to start server:", err);
        process.exit(1);
    }
}

startServer();
