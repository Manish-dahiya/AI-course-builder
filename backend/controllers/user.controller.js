const express = require("express");
const User = require("../models/user.model");
const Course = require("../models/course.model");
const Review = require("../models/review.model");

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

async function WriteUserReview(req,res){
    const {review}= req.body;
    try {
        const response= await Review.create(review);
        console.log("review saved:",response);

        return res.json({"message":"review posted successfully"});
    } catch (error) {
        console.log(error);
        return res.json({"message":error?.errorResponse?.errmsg})
    }
}

async function fetchAllReviews(req,res){
    try {
        const response= await Review.find().sort({ createdAt: -1 }).limit(6); //top 6 newest reviews
        return res.json({"all_reviews":response});
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    loginUser,
    deleteUser,
    WriteUserReview,
    fetchAllReviews
}