import { Request, Response } from "express";
const asyncHandler = require("express-async-handler"); // ? handy package to handle async errors
const User = require("../models/userModel"); // ? import the user model
const generateToken = require("../config/generateToken"); // ? import the generateToken function
import { AuthorizedRequest } from "../middleware/authMiddleware";

type UserType = {
  _id: string;
  username: string;
  password: string;
  pic: string | null;
  matchPassword: (password: string) => Promise<boolean>;
};

const registerUser = asyncHandler(async (req: Request, res: Response) => {
  // * get the things from the request body
  const { username, password }: UserType = req.body;

  // * check if the types are correct
  if (typeof username !== "string" || typeof password !== "string") {
    res.status(400);
    throw new Error("Something is wrong with the types");
  }

  // * check if all the fields are filled
  if (!username || !password) {
    res.status(400);
    throw new Error("Please fill all the fields");
  }

  // * check if the user already exists
  const userExists = await User.findOne({ username }).select("-password");
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  // * create a new user
  const user: UserType = await User.create({
    username,
    password,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      username: user.username,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Failed to Create the User");
  }
});

// * login user
const loginUser = asyncHandler(async (req: Request, res: Response) => {
  // * get the things from the request body
  const { username, password }: UserType = req.body;

  // * check if the types are correct
  if (typeof username !== "string" || typeof password !== "string") {
    res.status(400);
    throw new Error("Something is wrong with the types");
  }

  // * check if all the fields are filled
  if (!username || !password) {
    res.status(400);
    throw new Error("Please fill all the fields");
  }

  // * check if the user exists
  const user: UserType = await User.findOne({ username });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      username: user.username,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid Credentials");
  }
});

// ! protected route
// /api/user?search=gandonas
const allUsers = asyncHandler(async (req: AuthorizedRequest, res: Response) => {
  // get the keyword from the search query
  const keyword = req.query.search;

  if (keyword) {
    // get the user
    const user: UserType = await User.findOne({ username: keyword }).select(
      "-password"
    );

    if (user) {
      res.send(user);
    } else {
      res.status(404);
      throw new Error("User does not exist");
    }
  } else {
    res.status(400);
    throw new Error("Username was not provided");
  }
});

module.exports = { registerUser, loginUser, allUsers };
