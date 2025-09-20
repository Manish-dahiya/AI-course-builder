const express= require("express");
const router= express.Router();

const {generateCoursePlan}= require("../controllers/course.controller.js");
router.get("/generate-course",generateCoursePlan);

module.exports=router;