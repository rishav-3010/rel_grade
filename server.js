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
  "saipraveen.kolagani2022@vitstudent.ac.in",
  "aniket.choudhury2022@vitstudent.ac.in",
  "rohan.mallik2022@vitstudent.ac.in",
  "gongati.avinash2022@vitstudent.ac.in",
  "mannuru.geethanadh2022@vitstudent.ac.in",
  "paturunaga.tanmay2022@vitstudent.ac.in",
  "prateek.sharma2022@vitstudent.ac.in",
  "saksham.singh2022a@vitstudent.ac.in",
  "medha.mansi2022@vitstudent.ac.in",
  "arushi.kondilya2022@vitstudent.ac.in",
  "vyshnavikrishna.r2022@vitstudent.ac.in",
  "palla.venkata2022@vitstudent.ac.in",
  "bhumireddy.nivedh2022@vitstudent.ac.in",
  "boyapati.mithil2022@vitstudent.ac.in",
  "ayush.sharma2022@vitstudent.ac.in",
  "saisushanth.b2022@vitstudent.ac.in",
  "vikas.2022@vitstudent.ac.in",
  "yashwant.chowdary2022@vitstudent.ac.in",
  "hemanth.s2022@vitstudent.ac.in",
  "bonthagorla.sowmith2022@vitstudent.ac.in",
  "deekshithreddy.v2022@vitstudent.ac.in",
  "neelmitesh.asher2022@vitstudent.ac.in",
  "gunupati.pavan2022@vitstudent.ac.in",
  "shaiktaha.hasan2022@vitstudent.ac.in",
  "sapuri.ramsai2022@vitstudent.ac.in",
  "deepeshreddy.g2022@vitstudent.ac.in",
  "kottepavan.kalyan2022@vitstudent.ac.in",
  "chitturipavan.kumar2022@vitstudent.ac.in",
  "gudesiva.tejesh2022@vitstudent.ac.in",
  "saketh.ashrith2022@vitstudent.ac.in",
  "prabhath.avadhanam2022@vitstudent.ac.in",
  "yuvanesh.m2022@vitstudent.ac.in",
  "bodduluru.jaya2022@vitstudent.ac.in",
  "chds.rahul2022@vitstudent.ac.in",
  "ayyakannu.arun2022@vitstudent.ac.in",
  "aryaman.parashar2022@vitstudent.ac.in",
  "aman.khanna2022@vitstudent.ac.in",
  "dhairya.dipakkumar2022@vitstudent.ac.in",
  "divyesh.narshi2022@vitstudent.ac.in",
  "shreyas.sunil2022@vitstudent.ac.in",
  "aditya.pradhan2022@vitstudent.ac.in",
  "akanksha.dinesh2022@vitstudent.ac.in",
  "ishant.dhakad2022@vitstudent.ac.in",
  "arshiya.2022@vitstudent.ac.in",
  "abhemanth.varma2022@vitstudent.ac.in",
  "rishiraam.gopinath2022@vitstudent.ac.in",
  "sai.abhinavreddy2022@vitstudent.ac.in",
  "rishav.vajpayee2022@vitstudent.ac.in",
  "sai.sumanth2022@vitstudent.ac.in",
  "kishan.s2022@vitstudent.ac.in",
  "pandigunta.deeraj2022@vitstudent.ac.in",
  "rithanyaa.jr2022@vitstudent.ac.in",
  "somil.arora2022@vitstudent.ac.in",
  "rohithreddy.gundadi2022@vitstudent.ac.in",
  "abhiraj.das2022@vitstudent.ac.in",
  "abhirup.das2022a@vitstudent.ac.in",
  "simar.bhatia2022@vitstudent.ac.in",
  "vedangjitendra.garg2022@vitstudent.ac.in",
  "kamatham.ganesh2022@vitstudent.ac.in",
  "suyash.mishra2022@vitstudent.ac.in",
  "preethi.2022@vitstudent.ac.in",
  "kukati.venkata2022@vitstudent.ac.in",
  "pradyumna.sameer2022@vitstudent.ac.in",
  "naralakoushik.reddy2022a@vitstudent.ac.in",
  "meilita.maxim2022b@vitstudent.ac.in",
  "pratyushsingh.soni2022@vitstudent.ac.in",
  "saksham.kapoor2022@vitstudent.ac.in",
  "sneha.sehgal2022@vitstudent.ac.in",
  "kenguva.abhinav2022@vitstudent.ac.in",
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