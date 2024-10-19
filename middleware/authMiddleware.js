const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const User = require("../models/userModels");

const protect = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies.token;
    console.log("Token:", token);

    if (!token) {
      res.status(401);
      throw new Error("Not authorized, please login");
    }

    // Verify Token
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Verified:", verified);

    const user = await User.findById(verified.id).select("-password");
    if (!user) {
      res.status(401);
      throw new Error("User not found");
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("Error:", error.message);
    res.status(401);
    throw new Error("Not authorized, please login !");
  }
});

// Admin only
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(401);
    throw new Error("Not authorized as admin.");
  }
};

module.exports = {
  protect,
  adminOnly,
};
