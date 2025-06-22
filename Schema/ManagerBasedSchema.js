const mongoose = require('mongoose')

const otherManagerSchema = new mongoose.Schema({
  email: String,
  id: String,
  name: String,
}, { _id: false });

const candidateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  gender: { type: String, required: true },
  position: { type: String, required: true },
  email: { type: String, required: true },
  otherManagers: [otherManagerSchema],
}, { _id: false });

const managerCandidateSchema = new mongoose.Schema({
  managerAssigenedCandidate: { type: String, required: true },
  candidates: [candidateSchema],
}, { timestamps: true });

module.exports = mongoose.model("ManagerCandidate", managerCandidateSchema);
