const mongoose = require('mongoose')

const receiverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true }
}, { _id: false });

const messageSchema = new mongoose.Schema({
  candidateEmail: { type: String, required: true },
  sender: { type: String, required: true },
  senderEmail: { type: String, required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  senderSocketId: { type: String },
  receivers: [receiverSchema]
});

module.exports = mongoose.model("Message", messageSchema);
