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
  "vajpayeerishav@gmail.com"
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

    user.mark = value;
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

    const mean = marks.reduce((a, b) => a + b, 0) / marks.length;
    const stdDev = Math.sqrt(marks.reduce((sum, m) => sum + Math.pow(m - mean, 2), 0) / marks.length);
    const round = x => Math.round(x * 100) / 100;

    const result = {
      count: marks.length,
      mean: round(mean),
      stdDev: round(stdDev),
      S: round(mean + 1.5 * stdDev),
      A: [round(mean + 0.5 * stdDev), round(mean + 1.5 * stdDev)],
      B: [round(mean - 0.5 * stdDev), round(mean + 0.5 * stdDev)],
      C: [round(mean - 1.0 * stdDev), round(mean - 0.5 * stdDev)],
      D: [round(mean - 1.5 * stdDev), round(mean - 1.0 * stdDev)],
      E: [round(mean - 2.0 * stdDev), round(mean - 1.5 * stdDev)],
      F: round(mean - 2.0 * stdDev)
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