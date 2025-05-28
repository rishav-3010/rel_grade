// Final server.js with MongoDB (use this once MongoDB connection works)
require('dotenv').config();
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');
const session = require('express-session');

const app = express();
const PORT = 3000;

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const allowedEmails = [
  "utkarsh.gupta2021a@vitstudent.ac.in",
  "santanakumar.i2021@vitstudent.ac.in",
  "nikhil.kumar2021b@vitstudent.ac.in",
  "anirudh.giri2021@vitstudent.ac.in",
  "shivam.raj2021@vitstudent.ac.in",
  "saikishore.k2021@vitstudent.ac.in",
  "mummadinripesh.reddy2021@vitstudent.ac.in",
  "abhimanyu.katariya2021@vitstudent.ac.in",
  "adluru.umesh2021@vitstudent.ac.in",
  "niranjan.sbinu2021@vitstudent.ac.in",
  "bodasandeep.sai2021@vitstudent.ac.in",
  "saksham.gahlot2021@vitstudent.ac.in",
  "harshraj.anand2021@vitstudent.ac.in",
  "charlese.patel2021@vitstudent.ac.in",
  "aditya.singh2021b@vitstudent.ac.in",
  "aania.kanwal2021@vitstudent.ac.in",
  "atul.vats2021@vitstudent.ac.in",
  "hemanthraj.ns2021@vitstudent.ac.in",
  "tejmaganbhai.bhakhar2021@vitstudent.ac.in",
  "anirudh.garg2021@vitstudent.ac.in",
  "utkarsh.singh2021@vitstudent.ac.in",
  "parthav.snair2021@vitstudent.ac.in",
  "vudathu.aashrith2021@vitstudent.ac.in",
  "pratham.verma2021@vitstudent.ac.in",
  "tarang.arora2021@vitstudent.ac.in",
  "vibhav.vishnoi2021@vitstudent.ac.in",
  "samithran.ramesh2021@vitstudent.ac.in",
  "praneethreddy.vp2021@vitstudent.ac.in",
  "jaydenphilip.thomas2021@vitstudent.ac.in",
  "krishnakumar.r2021@vitstudent.ac.in",
  "aryanbalaji.ram2021@vitstudent.ac.in",
  "perugurishi.kiran2021@vitstudent.ac.in",
  "bhanuprakash.n2021@vitstudent.ac.in",
  "biswayan.mandal2021@vitstudent.ac.in",
  "kandibandarathan.sai2021@vitstudent.ac.in",
  "kodumurivenkat.rohith2021@vitstudent.ac.in",
  "shivanshu.tiwari2021@vitstudent.ac.in",
  "snehanshu.chakraborty2021@vitstudent.ac.in",
  "anjali.muskan2021@vitstudent.ac.in",
  "yash.ranjan2021@vitstudent.ac.in",
  "anshulraina.2021@vitstudent.ac.in",
  "tetalidurga.venkata2021@vitstudent.ac.in",
  "aleeza.tariq2022@vitstudent.ac.in",
  "tayuvan.prakash2022@vitstudent.ac.in",
  "krishnakumar.r2022@vitstudent.ac.in",
  "ss.soorajkumar2022@vitstudent.ac.in",
  "ronicaa.sivashini2022@vitstudent.ac.in",
  "ayushman.tomar2022@vitstudent.ac.in",
  "hridansh.motwani2022@vitstudent.ac.in",
  "ansh.dubey2022@vitstudent.ac.in",
  "manan.rakhecha2022@vitstudent.ac.in",
  "palaparthi.jagadish2022@vitstudent.ac.in",
  "murari.varma2022@vitstudent.ac.in",
  "rudra.malik2022@vitstudent.ac.in",
  "prajesh.dutta2022@vitstudent.ac.in",
  "atri.chakraborty2022@vitstudent.ac.in",
  "vikas.nagendra2022@vitstudent.ac.in",
  "kamaleswar.s2022@vitstudent.ac.in",
  "manavkuldeep.soni2022@vitstudent.ac.in",
  "anup.ghimire2022@vitstudent.ac.in",
  "debojit.roy2022@vitstudent.ac.in",
  "rishav.vajpayee2022@vitstudent.ac.in",
  "ishaan.yadav2022@vitstudent.ac.in",
  "mukkamalla.r2022@vitstudent.ac.in",
  "satyam.bharti2022@vitstudent.ac.in",
  "kukati.venkata2022@vitstudent.ac.in",
  "stevealex.mathew2022@vitstudent.ac.in",
  "mitali.saxena2023@vitstudent.ac.in"
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

app.use(session({
  secret: 'your-secret-key-here',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  mark: Number,
  submitted: { type: Boolean, default: false }
});
const User = mongoose.model('User', userSchema);

// Auth
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

    // Store user in session
    req.session.user = { email, name };
    
    console.log(`✅ Authorized: ${name} (${email})`);
    res.status(200).json({ success: true, email, name });
  } catch (err) {
    console.error('❌ Auth error:', err);
    res.status(400).json({ success: false, message: "Invalid token" });
  }
});

// Check session
app.get('/api/check-session', (req, res) => {
  if (req.session.user) {
    res.json({ 
      success: true, 
      email: req.session.user.email, 
      name: req.session.user.name 
    });
  } else {
    res.json({ success: false });
  }
});

// Logout endpoint
app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destroy error:', err);
      return res.status(500).json({ success: false });
    }
    res.json({ success: true });
  });
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