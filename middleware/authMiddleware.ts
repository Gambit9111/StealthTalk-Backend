const jwt = require("jsonwebtoken");
const User = require("../models/userModel.ts");
const asyncHandler = require("express-async-handler");
import { Request, Response, NextFunction } from "express";

export interface AuthorizedRequest extends Request {
  user: {
    _id: string;
    username: string;
    pic: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
}

const protect = asyncHandler(
  async (req: AuthorizedRequest, res: Response, next: NextFunction) => {
    let token: string;

    // * check if there is a bearer token in the authorization headers
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      try {
        token = req.headers.authorization.split(" ")[1];

        // decode token id
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // find the user by id and return it without the password, attach it to the req object for use later
        req.user = await User.findById(decoded.id).select("-password");

        next();
      } catch (error) {
        res.status(401);
        throw new Error("Not Authorized, token failed");
      }
    } else {
      res.status(400);
      throw new Error("Token was not provided");
    }
  }
);

module.exports = { protect };
