const User = require('../modals/authmodal');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const bcrypt = require("bcrypt");

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

exports.signup = async (req, res) => {
  try {
    const { name, Phone, Password, comfirmpassword } = req.body;

    // Check if passwords match
    if (Password !== comfirmpassword) {
      return res.status(400).json({
        status: "fail",
        message: "Passwords do not match",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(Password, 10);

    const newUser = await User.create({
      name,
      Phone,
      Password: hashedPassword, // store hash
    });

    const token = signToken(newUser._id);

    res.status(201).json({
      status: "success",
      token,
      data: { user: newUser },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { Phone, Password } = req.body;

    if (!Phone || !Password) {
      throw new Error("Please provide phone and password");
    }

    // Find user with password field
    const user = await User.findOne({ Phone });
    if (!user) {
      throw new Error("Invalid phone number or password");
    }

    // Compare password
    const isMatch = await bcrypt.compare(Password, user.Password);
    if (!isMatch) {
      throw new Error("Invalid phone number or password");
    }

    const token = signToken(user._id);

    res.status(200).json({
      status: "success",
      token,
      data: { user },
    });
  } catch (err) {
    res.status(401).json({
      status: "fail",
      message: err.message,
    });
  }
};



exports.updatePasswordByPhone = async (req, res) => {
  try {
    const { Phone, Password, comfirmpassword } = req.body;

    // 1️⃣ Check if phone number exists
    const user = await User.findOne({ Phone });
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "Phone number not found",
      });
    }

    // 2️⃣ Check if passwords match
    if (Password !== comfirmpassword) {
      return res.status(400).json({
        status: "fail",
        message: "Passwords do not match",
      });
    }

    // 3️⃣ Hash the new password
    const hashedPassword = await bcrypt.hash(Password, 10);

    // 4️⃣ Update password in DB
    user.Password = hashedPassword;
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Password updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};
exports.protect = async (req, res, next) => {
  try {
    // 1) Getting token and check if it's there
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new Error('You are not logged in! Please log in to get access.');
    }

    // 2) Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      throw new Error('The user belonging to this token does no longer exist.');
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    next();
  } catch (err) {
    res.status(401).json({
      status: 'fail',
      message: err.message
    });
  }
};