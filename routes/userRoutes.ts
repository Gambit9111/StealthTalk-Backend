const express = require("express");
const {
  registerUser,
  loginUser,
  allUsers,
} = require("../controllers/userControllers");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// ? 2 ways to declare a route
router.route("/").post(registerUser).get(protect, allUsers); // * register a user
router.post("/login", loginUser); // * login a user

module.exports = router;

export {};
