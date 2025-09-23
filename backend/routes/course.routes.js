const express= require("express");
const router= express.Router();

const {generateCoursePlan,getChapterContent,getCourseById,getAllCourses,getChapterVideo}= require("../controllers/course.controller.js");
const {generateChapterAudio}= require("../controllers/translationController.js")

router.post("/generate-course",generateCoursePlan);
router.post("/chapter",getChapterContent);
router.post("/chapter/get-chapter-video", getChapterVideo );//<----
router.post("/chapter/get-chapter-audio",generateChapterAudio)
router.get("/all-courses", getAllCourses );
router.get("/:id",getCourseById );

module.exports=router;