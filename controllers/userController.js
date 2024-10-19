const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/userModels");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

// Register User
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Validation
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please fill in all required fields");
  }
  if (password.length < 6) {
    res.status(400);
    throw new Error("Password must be up to 6 characters");
  }

  // Check if user exists (register)
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("Email has already been registered");
  }

  // Create new user
  const user = await User.create({
    name,
    email,
    password,
  });

  // Generate Token (Register)
  const token = generateToken(user._id);

  if (user) {
    const { _id, name, email, role } = user;
    res.cookie("token", token, {
      path: "/",
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 86400),
      // secure: true,
      // samesite: none
    });
    // Send user data
    res.status(201).json({
      _id,
      name,
      email,
      role,
      token,
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }

  res.send("Register User...");
});

// Login User
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate Request
  if (!email || !password) {
    res.status(400);
    throw new Error("Please add email and password");
  }

  // Check if user exists (auth)
  const user = await User.findOne({ email });
  if (!user) {
    res.status(400);
    throw new Error("User does not exist.");
  }

  // User Exists, check if password is correct
  const passwordIsCorrect = await bcrypt.compare(password, user.password);

  // Generate Token(auth)
  const token = generateToken(user._id);
  if (user && passwordIsCorrect) {
    const newUser = await User.findOne({ email }).select("-password");
    res.cookie("token", token, {
      path: "/",
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 86400),
    });
    // Send user data (auth)
    res.status(201).json(newUser);
  } else {
    res.status(400);
    throw new Error("Invalid email or password");
  }
});

// Logout User
const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("token", "", {
    path: "/",
    httpOnly: true,
    expires: new Date(0),
    // secure: true,
    // samesite: none,
  });
  res.status(200).json({ message: "Successfully Logged Out !" });
});

// Get User
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  if (user) {
    res.status(200).json(user);
  } else {
    res.status(400);
    throw new Error("User Not Found");
  }
});

// Get Login Status
const getLoginStatus = asyncHandler(async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json(false);
  }

  // Verify Token
  const verified = jwt.verify(token, process.env.JWT_SECRET);
  if (verified) {
    res.json(true);
  } else {
    res.json(false);
  }
});

// Update User
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    const { name, phone, adress } = user;
    user.name = req.body.name || name;
    user.phone = req.body.phone || phone;
    user.adress = req.body.adress || adress;

    const updateUser = await user.save();
    res.status(200).json(updateUser);
  } else {
    es.status(404);
    throw new Error("User not found");
  }
});

// Update photo
const updatePhoto = asyncHandler(async (req, res) => {
  const { photo } = req.body;
  const user = await User.findById(req.user._id);
  user.photo = photo;
  const updateUser = await user.save();
  res.status(200).json(updateUser);
});

// Save cart
const saveCart = asyncHandler(async (req, res) => {
  const { cartItems } = req.body;

  const user = await User.findById(req.user._id);

  if (user) {
    user.cartItems = cartItems;
    user.save();
    res.status(200).json({ message: "Cart saved" });
  } else {
    res.status(400);
    throw new Error("User Not Found");
  }
});

// Get cart
const getCart = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    // const { _id, name, email, phone, address } = user;
    res.status(200).json(user.cartItems);
  } else {
    res.status(400);
    throw new Error("User Not Found");
  }
});

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getUser,
  getLoginStatus,
  updateUser,
  updatePhoto,
  saveCart,
  getCart,
};
