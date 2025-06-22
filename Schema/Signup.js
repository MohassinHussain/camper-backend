const mongoose = require('mongoose');

const signupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  // id: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   required: true,
  //   ref: 'User'
  // },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  dateSignedUp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Signup', signupSchema);
