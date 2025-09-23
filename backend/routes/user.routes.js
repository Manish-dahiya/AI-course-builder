const express= require("express");
const checkJwt = require("../middlewares/auth");
const router= express.Router();

const {loginUser}= require("../controllers/user.controller")



router.post("/login", (req, res, next) => checkJwt(req, res, next) ,loginUser)

module.exports=router;