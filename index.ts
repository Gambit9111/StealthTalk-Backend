import { chats } from "./data/data";
import dotenv = require("dotenv");
import { Request, Response } from "express";
const express = require("express");
const app = express();
import cors = require("cors");
dotenv.config();
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
// *importing bunch of stuff

// *connecting to database
const connectDB = require("./config/db");
connectDB();

// *setting up cors
app.use(
  cors({
    origin: "*",
  })
);

// * since we are taking json data from the client we need to do this
app.use(express.json());

// * root url
app.get("/", (req: Request, res: Response) => {
  res.send("Your API is running");
});

// * user routes
app.use("/api/user", userRoutes);
// * chat routes
app.use("/api/chat", chatRoutes);

// * error handlers
app.use(notFound);
app.use(errorHandler);

// *running the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, console.log(`Server running on port ${PORT}`));
