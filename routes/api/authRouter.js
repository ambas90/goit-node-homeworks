const express = require("express");
const User = require("../../models/user.js");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const authMiddleware = require("../../middleware/jwt.js");
const gravatar = require("gravatar");
const fs = require("fs").promises;
const path = require("path");
const multer = require("multer");
const { v4: uuidV4 } = require("uuid");

const router = express.Router();

const signupSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

router.post("/signup", async (req, res, next) => {
  const { error } = signupSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { email, password } = req.body;
  const user = await User.findOne({ email }, { _id: 1 }).lean();
  if (user) {
    return res.status(409).json({ message: "Email in use" });
  }
  try {
    const newUser = new User({ email, password });
    const gravatarURL = gravatar.url(email);
    console.log(gravatarURL);
    await newUser.setPassword(password);
    newUser.avatarURL = gravatarURL;
    await newUser.save();
    return res.status(201).json({
      user: {
        email: email,
        subscription: newUser.subscription,
        avatarURL: newUser.avatarURL,
      },
    });
  } catch (e) {
    next(e);
  }
});

router.post("/login", async (req, res, next) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "No such user" });
    }

    const isPasswordCorrect = await user.validatePassword(password);
    if (isPasswordCorrect) {
      const payload = {
        id: user._id,
        email: user.email,
        subscription: user.subscription,
      };
      const token = jwt.sign(payload, process.env.SECRET, { expiresIn: "12h" });
      user.token = token;
      await user.save();

      return res.status(200).json({
        token: token,
        user: {
          email: user.email,
          subscription: user.subscription,
          avatarURL: user.avatarURL,
        },
      });
    } else {
      return res.status(401).json({ message: "Email or password is wrong" });
    }
  } catch (err) {
    next(err);
  }
});

router.get("/logout", authMiddleware, async (req, res, next) => {
  try {
    const userId = res.locals.user._id;
    const user = await User.findById(userId);

    user.token = null;
    await user.save();

    return res.status(200).json({ message: "user logged out" });
  } catch (err) {
    next(err);
  }
});

router.get("/current", authMiddleware, async (req, res, next) => {
  try {
    const currentUser = res.locals.user;
    return res.status(200).json({
      email: currentUser.email,
      subscription: currentUser.subscription,
      avatarURL: currentUser.avatarURL,
    });
  } catch (err) {
    next(err);
  }
});

// konfiguracja multera

const tempDir = path.join(process.cwd(), "../../temp");
const storeAvatarDir = path.join(process.cwd(), "../../public/avatars");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${uuidV4()}${file.originalname}`);
  },
});

const extensionWhiteList = [".jpg", ".jpeg", ".png", ".gif"];
const mimetypeWhiteList = ["image/png", "image/jpg", "image/jpeg", "image/gif"];

const uploadMiddleware = multer({
  storage,
  fileFilter: async (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const mimetype = file.mimetype;
    if (
      !extensionWhiteList.includes(extension) ||
      !mimetypeWhiteList.includes(mimetype)
    ) {
      return cb(null, false);
    }
    return cb(null, true);
  },
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
});

router.post(
  "/avatars",
  authMiddleware,
  uploadMiddleware.single("picture"),
  async (req, res, next) => {
    if (!req.file) {
      return res.status(400).json({ message: "File isn't a photo" });
    }
    const { path: temporaryPath } = req.file;
    const extension = path.extname(temporaryPath);
    const fileName = `${uuidV4()}${extension}`;
    const filePath = path.join(storeAvatarDir, fileName);

    try {
      const currentUser = res.locals.user;
      return res.status(200).json({ avatarURL: currentUser.avatarURL });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
