const mongoose = require("mongoose");

// Chapter Schema
const chapterSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  summary: {
    type: String,
    required: true,
  },
  aiContent:{
    type:String,
    default:"",
  },
  videoUrl:{
    type:String,
    default:""
  },
  audioUrl:{
    type:String,
    default:""
  },
  audioLanguage:{
    type:String,
    default:""
  }
});

// Module Schema
const moduleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  chapters: [chapterSchema], // array of chapters
});

// Course Schema
const courseSchema = new mongoose.Schema({
  courseName: {
    type: String,
    required: true,
  },
  modules: [moduleSchema], // array of modules
  userPrompt: { type: String, required: true },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Model
const Course = mongoose.model("Course", courseSchema);

module.exports = Course;
