const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
    trim: true
  },
  userEmail: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  text:{
    type:String
  },
  rating:{
    type:Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Review = mongoose.model("review", reviewSchema);

module.exports = Review;
