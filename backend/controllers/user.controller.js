const express = require("express");
const User = require("../models/user.model");

async function loginUser(req,res){
    try {
    const { sub} = req.auth; // decoded JWT
    const {name,email}= req.body //sent in body of fetch req from frontend
    console.log(sub,name,email);
    let user = await User.findOne({ auth0Id: sub });

    if (!user) {
      // New user → create
      user = await User.create({
        auth0Id: sub,
        userName: name,
        userEmail: email,
        courses: []
      });
    }

    console.log("user created ");

    res.json({ message: "User logged in", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }

}

module.exports={
    loginUser
}