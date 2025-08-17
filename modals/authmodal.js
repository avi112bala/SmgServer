const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false,
  },
  Phone: {
    type: Number,
    required: true,
  },
  Password: {
    type: String,
    required: true,
    minlength: 8,
  },
  comfirmpassword: {
    type: String,
    minlength: 8,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before sav

module.exports = mongoose.model('User', userSchema);