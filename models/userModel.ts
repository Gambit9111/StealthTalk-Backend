const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
import { NextFunction } from "express";

// *user model
const userModel = mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    pic: { type: String, default: "https://picsum.photos/200" },
  },
  {
    timestamps: true,
  }
);

// ! create a method on the user to match the password

userModel.methods.matchPassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ! encrypting the password before saving it to the database
userModel.pre("save", async function (next: NextFunction) {
  // @ts-ignore
  if (!this.isModified) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  // @ts-ignore
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model("User", userModel);
module.exports = User;
