const express = require("express");
const User = require("../models/user.model");
const Course = require("../models/course.model");

async function loginUser(req, res) {
    try {
        const { sub } = req.auth; // decoded JWT
        const { name, email } = req.body //sent in body of fetch req from frontend
        console.log(sub, name, email);
        let user = await User.findOne({ auth0Id: sub }).populate("courses");

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

async function deleteUser(req, res) {
    try {
    const { id } = req.params;

    // Check if user exists
    const userToDelete = await User.findById(id);
    if (!userToDelete) {
      return res.status(404).json({ message: "User not found" });
    }

    // Optionally: delete all courses created by this user
    await Course.deleteMany({ userId: id });

    // Delete the user
    await User.findByIdAndDelete(id);

    console.log("user deleted successfully")

    res.status(200).json({ message: "User and their courses deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error while deleting user" });
  }
}

module.exports = {
    loginUser,
    deleteUser
}