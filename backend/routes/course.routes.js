const express= require("express");
const router= express.Router();

const {generateCoursePlan,getChapterContent,getCourseById}= require("../controllers/course.controller.js");
router.post("/generate-course",generateCoursePlan);
router.get("/chapter/",getChapterContent);
router.get("/:id",getCourseById );

module.exports=router;