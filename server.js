// Final server.js with MongoDB (use this once MongoDB connection works)
require('dotenv').config();
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');

const app = express();
const PORT = 3000;

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const allowedEmails = [
  "rishav.vajpayee2022@vitstudent.ac.in",
  "vajpayeerishav79@gmail.com",
  "vajpayeerishav@gmail.com",
  "vajpayeeyukta06@gmail.com",
  "debasisbajpaie@gmail.com"
];

console.log('🚀 Server starting...');
console.log('Google Client ID:', process.env.GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Missing');
console.log('MongoDB URI:', process.env.MONGO_URI ? '✅ Set' : '❌ Missing');

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log('✅ Connected to MongoDB successfully!');
  console.log('📊 Database:', mongoose.connection.name);
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  console.error('🔧 Please fix MongoDB connection before proceeding');
});

app.use(cors());
app.use(express.json());

// Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  mark: Number,
  submitted: { type: Boolean, default: false }
});
const User = mongoose.model('User', userSchema);

// Auth
app.post('/api/auth/google', async (req, res) => {
  const { token } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const email = payload.email;
    const name = payload.name;

    console.log(`🔐 Auth attempt: ${email}`);

    if (!allowedEmails.includes(email)) {
      console.log(`❌ Unauthorized email: ${email}`);
      return res.status(403).json({ success: false });
    }

    console.log(`✅ Authorized: ${name} (${email})`);
    res.status(200).json({ success: true, email, name });
  } catch (err) {
    console.error('❌ Auth error:', err);
    res.status(400).json({ success: false, message: "Invalid token" });
  }
});

// Submit mark
app.post('/submit-mark', async (req, res) => {
  const { name, email, value } = req.body;
  console.log(`📝 Mark submission: ${name} (${email}) - ${value}`);

  if (
    typeof value !== 'number' ||
    !email ||
    !allowedEmails.includes(email)
  ) {
    console.log(`❌ Invalid submission from ${email}`);
    return res.status(403).send("Invalid mark or unauthorized email");
  }

  try {
    let user = await User.findOne({ email });

    if (user && user.submitted) {
      console.log(`❌ ${email} already submitted`);
      return res.status(403).send("You have already submitted your mark");
    }

    if (!user) {
      user = new User({ name, email });
    }

    user.mark = Math.ceil(value);
    user.submitted = true;
    await user.save();

    console.log(`✅ Mark saved to MongoDB for ${email}: ${value}`);
    res.send("Mark submitted successfully");
  } catch (err) {
    console.error('❌ Database error:', err);
    res.status(500).send("Database error");
  }
});

// Get grade bands
app.get('/calculate-grades', async (req, res) => {
  try {
    const marks = (await User.find({ submitted: true })).map(doc => doc.mark);
    console.log(`📊 Calculating grades for ${marks.length} marks:`, marks);
    
    if (marks.length === 0) {
      console.log('❌ No marks available for calculation');
      return res.status(400).send("No marks available");
    }

    // Calculate mean from rounded marks
const mean = marks.reduce((a, b) => a + b, 0) / marks.length;

// Calculate standard deviation
let variance = 0;
for (let mark of marks) {
  variance += Math.pow(mark - mean, 2);
}
variance /= marks.length;
const sigma = Math.sqrt(variance);

// Calculate cutoffs (exact same logic as Java)
const sCut = Math.max(mean + 1.5 * sigma, 80);
const aCut = mean + 0.5 * sigma;
const bCut = mean - 0.5 * sigma;
const cCut = mean - 1.0 * sigma;
const dCut = mean - 1.5 * sigma;
const eCut = mean - 2.0 * sigma;

// Round grade boundaries
const sMin = Math.round(sCut);
const aMin = Math.round(aCut);
const bMin = Math.round(bCut);
const cMin = Math.round(cCut);
const dMin = Math.round(dCut);
const eMin = Math.round(eCut);

// Adjust pass mark if E band minimum < 50
const passMark = Math.min(eMin, 50);

const result = {
  count: marks.length,
  mean: Math.round(mean * 100) / 100,
  stdDev: Math.round(sigma * 100) / 100,
  S: sMin <= 100 ? `>= ${sMin}` : "Not applicable (cutoff > 100)",
  A: `>= ${aMin} and < ${sMin}`,
  B: `>= ${bMin} and < ${aMin}`,
  C: `>= ${cMin} and < ${bMin}`,
  D: `>= ${dMin} and < ${cMin}`,
  E: `>= ${passMark} and < ${dMin}`,
  F: `< ${passMark}`,
  passMark: passMark
};

    console.log('✅ Grades calculated from MongoDB data:', result);
    res.json(result);
  } catch (err) {
    console.error('❌ Error calculating grades:', err);
    res.status(500).send("Error calculating grades");
  }
});

// Get all users
app.get('/get-users', async (req, res) => {
  try {
    const users = await User.find({}, 'name email submitted mark');
    console.log(`👥 Fetching ${users.length} users from MongoDB`);
    res.json(users);
  } catch (err) {
    console.error('❌ Error fetching users:', err);
    res.status(500).send('Server error');
  }
});

// Serve frontend
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`🌐 Server running at http://localhost:${PORT}`);
  console.log(`📁 Serving files from: ${path.join(__dirname, 'public')}`);
  console.log(`✅ Ready to accept connections!`);
});