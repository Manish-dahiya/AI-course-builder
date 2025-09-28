const express= require("express");
const checkJwt = require("../middlewares/auth");
const router= express.Router();

const {loginUser,deleteUser}= require("../controllers/user.controller")


router.post("/login", (req, res, next) => checkJwt(req, res, next) ,loginUser)
router.get("/delete-profile/:id",  (req, res, next) => checkJwt(req, res, next)   ,deleteUser )

module.exports=router;