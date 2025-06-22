const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    gender: String,
    email: { type: String, required: true, unique: true},
    position: String,
    addedBy: String,
    managers: [
      {
        email: String,
        id: String,
        name: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Candidate", candidateSchema);
