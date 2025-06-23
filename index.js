const { config } = require('dotenv')
const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require("cookie-parser");

const cors = require('cors');
const http = require("http");

const port = 5000


const app = express()

// app.use(cors());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

config();

const Signup = require('./Schema/Signup');
const CandidatesList = require('./Schema/CandidatesList')



app.post('/signup', async (req, res) => {
  try {
    const formData = req.body;
    const hashedPassword = await bcrypt.hash(formData.password, 10);

    const email = formData.email;
    const existingUser = await Signup.findOne({ email });
    if (existingUser) {
      return res.status(401).json({ message: 'User already exists' });
      // console.log("USer exists")
    }


    // Example: Save to MongoDB
    const newSignup = new Signup({
      ...formData,
      password: hashedPassword,
      dateSignedUp: new Date()
    });

    await newSignup.save();

    res.status(201).json({ message: 'User created successfully', data: newSignup });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong', error });
  }
});


app.post('/auth/login', async (req, res) => {
  try {
    const formData = req.body;
    const email = formData.email;
    const user = await Signup.findOne({ email });
    // console.log(user);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(formData.password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }


    // Create JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict", 
      maxAge: 60 * 60 * 1000, // 1h
    });

    res.status(200).json({ message: 'Login successful', data: user });



  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong', error });
  }
});


app.get("/logged-in", (req, res) => {
  const token = req.cookies.auth_token;

  if (!token) return res.status(401).json({ message: "Not authenticated" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ user: decoded });
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
});

app.post('/logout', (req, res) => {
  res.clearCookie('auth_token', {
    httpOnly: true,
    secure: false,
    sameSite: 'Lax'
  });
  res.status(200).json({ message: 'Logged out' });
});

const Candidate = require('./Schema/Candidate')

// app.post('/addCandidate', async (req, res) => {
//   try {
//     const { data } = req.body;
//     console.log(data);
    
//     // const email = data.email;
//     // const existingUser = await Signup.findOne({ email });
//     // if (existingUser) {
//     //   return res.status(401).json({ message: 'User already exists' });
//     //   // console.log("USer exists")
//     // }

//     if (!Array.isArray(data) || data.length === 0) {
//       return res.status(400).json({ message: 'No candidate data provided' });
//     }

//     let existingDoc = await CandidatesList.findOne();

//     if (!existingDoc) {
//       // If no document exists, create a new one
//       const newEntry = new CandidatesList({ data });
//       await newEntry.save();
//       return res.status(201).json({ message: 'New candidates list created', data: newEntry });
//     }

//     // Replace the entire array
//     existingDoc.data = data;
//     await existingDoc.save();

//     res.status(200).json({ message: 'Candidates list replaced successfully', data: existingDoc });

//   } catch (error) {
//     console.error('Error in /addCandidate:', error);
//     res.status(500).json({ message: 'Server error', error });
//   }
// });


app.post('/addCandidate', async (req, res) => {
  try {
    const data = req.body;

    const existing = await Candidate.findOne({ email: data.email });
    if (existing) {
      return res.status(409).json({ message: "Candidate already exists" });
    }

    const newCandidate = new Candidate(data);
    await newCandidate.save();

    res.status(201).json({ message: "Candidate added successfully", data: newCandidate });
  } catch (error) {
    console.error("Error in /addCandidate:", error);
    res.status(500).json({ message: "Server error", error });
  }

});

app.get("/fetch-candidates", async (req, res) => {
  try {
    const candidates = await Candidate.find(); // Optional: sort newest first
    res.status(200).json({ message: "Candidates fetched successfully", data: candidates });
  } catch (error) {
    console.error("Error fetching candidates:", error);
    res.status(500).json({ message: "Server error", error });
  }
});


// app.delete("/delete-candidate/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const deleted = await Candidate.findByIdAndDelete(id);
//     if (!deleted) {
//       return res.status(404).json({ message: "Candidate not found" });
//     }
//     res.status(200).json({ message: "Candidate deleted successfully" });
//   } catch (err) {
//     console.error("Delete error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });


app.delete("/delete-candidate/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const candidate = await Candidate.findById(id);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    const candidateEmail = candidate.email;

    await Candidate.findByIdAndDelete(id);
    await Message.deleteMany({ candidateEmail });

    res.status(200).json({
      message: "Candidate and related messages deleted successfully",
    });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: "Server error" });
  }
});



const { setupSocket } = require("./socket");

const server = http.createServer(app);
setupSocket(server);


// app.put("/update-manager/:id", async (req, res) => {
//   const { id } = req.params;
//   const { name, email } = req.body;

//   await Candidate.updateMany(
//     { "managers.id": id },
//     {
//       $set: {
//         "managers.$.name": name,
//         "managers.$.email": email,
//       },
//     }
//   );

//   res.send({ message: "Manager updated" });
// });

// app.delete("/delete-manager/:id", async (req, res) => {
//   const { id } = req.params;
//   await Candidate.updateMany({}, { $pull: { managers: { id } } });
//   res.send({ message: "Manager deleted" });
// });


const Message = require('./Schema/Message')

app.post('/messages', async (req, res) => {
  try {
    const newMessage = new Message(req.body);
    await newMessage.save();
    res.status(201).json({ message: 'Message saved successfully', data: newMessage });
  } catch (error) {
    console.error("Error saving message:", error);
    res.status(500).json({ message: 'Server error', error });
  }
});

app.get("/messages/:candidateEmail", async (req, res) => {
  try {
    const { candidateEmail } = req.params;
    const messages = await Message.find({ candidateEmail }).sort({ timestamp: 1 }); // oldest first
    res.status(200).json({ data: messages });
  } catch (err) {
    res.status(500).json({ message: "Error fetching messages", error: err });
  }
});


// for notifications

app.get("/notifications/:userEmail", async (req, res) => {
  const userEmail = req.params.userEmail;

  try {
    const newMessages = await Message.find({
      senderEmail: { $ne: userEmail },
      $or: [
        { "receivers.email": userEmail },  // tagged
        { candidateEmail: { $in: await getCandidateEmailsByManager(userEmail) } } // involved
      ]
    }).sort({ timestamp: -1 });

    res.status(200).json({ data: newMessages });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch notifications." });
  }
});
//helper
async function getCandidateEmailsByManager(email) {
  const candidates = await Candidate.find({
    "managers.email": email
  });

  return candidates.map((c) => c.email);
}




mongoose.connect(process.env.CONNECTION_STRING)
  .then(() => {
    console.log("Connnected");
    server.listen(port, "0.0.0.0",(req, res) => {
      console.log("Server Listening at ", port);
    })
  }).catch((e) => {
    console.log(e);
  })

