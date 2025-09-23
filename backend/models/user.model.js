const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  auth0Id: {             // ✅ store Auth0 user ID (sub)
    type: String,
    required: true,
    unique: true
  },
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
  courses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course"
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model("User", userSchema);

module.exports = User;
