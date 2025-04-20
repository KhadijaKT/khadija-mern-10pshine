//models/User.js

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true, 
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, 
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  // Use bcryptjs's auto-salt (more reliable)
  this.password = await bcrypt.hash(this.password, 10); // 10 = salt rounds
  next();
});

// Compare method (ensure it uses bcrypt.compare)
userSchema.methods.matchPassword = async function (enteredPassword) {
  console.log("Comparing:", enteredPassword, this.password);
  return await bcrypt.compare(enteredPassword, this.password);
};


module.exports = mongoose.model("User", userSchema);
