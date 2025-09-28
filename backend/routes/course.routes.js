const express= require("express");
const router= express.Router();

const {generateCoursePlan,getChapterContent,getCourseById,getAllCourses,getChapterVideo,deleteCourse}= require("../controllers/course.controller.js");
const {generateChapterAudio}= require("../controllers/translationController.js")

router.post("/generate-course",generateCoursePlan);
router.post("/chapter",getChapterContent);
router.post("/chapter/get-chapter-video", getChapterVideo );//<----
router.post("/chapter/get-chapter-audio",generateChapterAudio)
router.get("/delete-course/:id",deleteCourse);
// router.get("/all-courses/:userId", getAllCourses );
router.get("/:id",getCourseById );

module.exports=router;