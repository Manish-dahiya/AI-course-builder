const express= require("express");
const router= express.Router();

const {generateCoursePlan,getChapterContent}= require("../controllers/course.controller.js");
router.post("/generate-course",generateCoursePlan);
router.get("/chapter/",getChapterContent);

module.exports=router;