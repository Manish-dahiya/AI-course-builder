const express=require("express");

const app=express();
const dotenv=require("dotenv")
const cors=require("cors")
app.use(cors({
  origin: "*",   //<----------------------- or explicitly "http://192.168.31.36:5173"
  methods: ["GET", "POST", "PUT", "DELETE"]
}));


dotenv.config();
const port=process.env.PORT

const db=require("./dbConfig/dbConfig.js");
app.use(express.json())


const courseRoutes = require("./routes/course.routes.js");
const userRoutes= require("./routes/user.routes.js");
app.use("/api/courses", courseRoutes);
app.use("/api/users", userRoutes);

app.listen(port,"0.0.0.0",()=>{ //<----------------
    console.log("server started at ",port);
})