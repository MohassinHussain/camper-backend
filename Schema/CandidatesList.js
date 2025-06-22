// const mongoose = require('mongoose');

// const managerSchema = new mongoose.Schema({
//     email: {type: String, unique: true},
//     id: {type: String, unique: true},
//     name: String,
// }, { _id: false });

// const candidateSchema = new mongoose.Schema({
//     name: { type: String, required: true },
//     gender: String,
//     email: { type: String, required: true, unique: true },
//     position: String,
//     addedBy: { type: String, required: true },
//     managers: [managerSchema]
// }, { _id: false });

// const candidatesListSchema = new mongoose.Schema({
//     data: [candidateSchema],
//     createdAt: { type: Date, default: Date.now }
// });

// module.exports = mongoose.model('CandidatesList', candidatesListSchema);


