const express= require("express");
const router= express.Router();

const {generateCoursePlan,getChapterContent,getCourseById,getAllCourses,getChapterVideo,deleteCourse,markChapterRead ,getChapterQuestions,notifyCourseReady}= require("../controllers/course.controller.js");
const {generateChapterAudio}= require("../controllers/translationController.js")

router.post("/generate-course",generateCoursePlan);
router.post("/notify-ready", notifyCourseReady);

router.post("/chapter",getChapterContent);
router.post("/chapter/get-chapter-video", getChapterVideo );//<----
router.post("/chapter/get-chapter-audio",generateChapterAudio)
router.get("/chapter/mark-as-read/:chapterId" ,markChapterRead)
router.get("/chapter/questions/:chapterId" ,getChapterQuestions)
router.get("/delete-course/:id",deleteCourse);
// router.get("/all-courses/:userId", getAllCourses );
router.get("/:id",getCourseById );

module.exports=router;