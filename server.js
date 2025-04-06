// server.js
const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

let users = {};
let otpStore = {};

const USERS_FILE = path.join(__dirname, "users.json");
if (fs.existsSync(USERS_FILE)) {
  users = JSON.parse(fs.readFileSync(USERS_FILE));
}

function saveUsers() {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "svasanth577@gmail.com",
    pass: "mtpa bfzf tsqd kqwo",
  },
});

app.post("/register", (req, res) => {
  const { name, email, password } = req.body;
  if (users[email]) {
    return res.json({ success: false, message: "Email already registered." });
  }
  users[email] = { name, password };
  saveUsers();
  res.json({ success: true, message: "Registered successfully!" });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = users[email];
  if (!user || user.password !== password) {
    return res.json({ success: false, message: "Invalid credentials." });
  }
  const otp = generateOTP();
  otpStore[email] = otp;

  console.log(`OTP for ${email} is ${otp}`);

  const mailOptions = {
    from: "youremail@gmail.com",
    to: email,
    subject: "Login OTP",
    text: `Your login OTP is: ${otp}`,
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error(err);
      return res.json({ success: false, message: "Failed to send OTP." });
    }
    res.json({ success: true, message: "OTP sent to your email." });
  });
});

app.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  if (otpStore[email] === otp) {
    delete otpStore[email];
    res.json({ success: true });
  } else {
    res.json({ success: false, message: "Invalid OTP." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
