const asyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel");
import { AuthorizedRequest } from "../middleware/authMiddleware";
import { Response } from "express";
const User = require("../models/userModel"); // ? import the user model

const accessChat = asyncHandler(
  async (req: AuthorizedRequest, res: Response) => {
    // * send the id of the user you want to chat with
    const { userId } = req.body;

    if (!userId) {
      console.log("UserId param not sent with request");
      return res.sendStatus(400);
    }

    // * check if the chat already exists

    let isChat = await Chat.find({
      isGroupChat: false,
      $and: [
        // ? Match both ids
        { users: { $elemMatch: { $eq: req.user._id } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    })
      .populate("users", "-password")
      .populate("latestMessage");

    isChat = await User.populate(isChat, {
      path: "latestMessage.sender",
      select: "username email",
    });

    if (isChat.length > 0) {
      // * if there is atleast 1 message in the chat we will send the chat
      res.send(isChat[0]);
    } else {
      // * otherwise create a new chat
      let chatData = {
        chatName: "sender",
        isGroupChat: false,
        users: [req.user._id, userId],
      };

      try {
        const createdChat = await Chat.create(chatData);

        const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
          "users",
          "-password"
        );

        res.status(200).send(FullChat);
      } catch (error) {
        res.status(400);
        // @ts-ignore
        throw new Error(error.message);
      }
    }
  }
);

const fetchChats = asyncHandler(
  async (req: AuthorizedRequest, res: Response) => {
    try {
      Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
        .populate("users", "-password")
        .populate("groupAdmin", "-password")
        .populate("latestMessage")
        .sort({ updatedAt: -1 })
        // @ts-ignore
        .then(async (results) => {
          results = await User.populate(results, {
            path: "latestMessage.sender",
            select: "name pic email",
          });
          res.status(200).send(results);
        });
    } catch (error) {
      res.status(400);
      // @ts-ignore
      throw new Error(error.message);
    }
  }
);

const createGroupChat = asyncHandler(
  async (req: AuthorizedRequest, res: Response) => {
    if (!req.body.users || !req.body.name) {
      return res.status(400).send({ message: "Please Fill all the fields" });
    }

    let users = JSON.parse(req.body.users);

    // @ts-ignore
    if (users.length < 2) {
      return res
        .status(400)
        .send("More then 2 users are required to form a group chat");
    }

    // @ts-ignore
    users.push(req.user);

    try {
      const groupChat = await Chat.create({
        chatName: req.body.name,
        users: users,
        isGroupChat: true,
        groupAdmin: req.user,
      });

      const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
        .populate("users", "-password")
        .populate("groupAdmin", "-password");

      res.status(200).json(fullGroupChat);
    } catch (error) {
      res.status(400);
      // @ts-ignore
      throw new Error(error.message);
    }
  }
);

const renameGroup = asyncHandler(
  async (req: AuthorizedRequest, res: Response) => {
    const { chatId, chatName } = req.body;

    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        chatName,
      },
      {
        new: true,
      }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!updatedChat) {
      res.status(404);
      throw new Error("Chat Not Found");
    } else {
      res.json(updatedChat);
    }
  }
);

const addToGroup = asyncHandler(
  async (req: AuthorizedRequest, res: Response) => {
    const { chatId, userId } = req.body;

    const added = await Chat.findByIdAndUpdate(
      chatId,
      {
        $push: { users: userId },
      },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!added) {
      res.status(404);
      throw new Error("Chat Not Found");
    } else {
      res.json(added);
    }
  }
);

const removeFromGroup = asyncHandler(
  async (req: AuthorizedRequest, res: Response) => {
    const { chatId, userId } = req.body;

    const removed = await Chat.findByIdAndUpdate(
      chatId,
      {
        $pull: { users: userId },
      },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!removed) {
      res.status(404);
      throw new Error("Chat Not Found");
    } else {
      res.json(removed);
    }
  }
);

module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
};
