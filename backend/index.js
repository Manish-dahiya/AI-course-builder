const express=require("express");

const app=express();
const dotenv=require("dotenv")
const cors=require("cors")
app.use(cors());


dotenv.config();
const port=process.env.PORT

const db=require("./dbConfig/dbConfig.js");

app.use(express.json())


const courseRoutes = require("./routes/course.routes.js");
app.use("/api/courses", courseRoutes);

app.listen(port,()=>{
    console.log("server started at ",port);
})