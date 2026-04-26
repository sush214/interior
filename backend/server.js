const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const helmet = require('helmet');
const cors = require('cors');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;


// ====================== MIDDLEWARE ======================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());

// Serve static HTML/CSS/JS from kbinterio.com folder
app.use(express.static(path.join(__dirname, 'kbinterio.com')));

// ====================== MYSQL CONNECTION ======================
const db = mysql.createPool({
  host: "localhost",
  user: "mbhhbvzm_lead",
  password: "La#pt@9p!",
  database: "mbhhbvzm_leads_generate",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// ====================== EMAIL SETUP ======================
const transporter = nodemailer.createTransport({
  host: "mail.kbinterio.com",
  port: 465,
  secure: true,
  auth: {
    user: "info@kbinterio.com",
    pass: "Kbint@2025"  
  }
});

// ====================== ROUTE: Save Estimate ======================
app.post("/api/estimate", (req, res) => {
  const { name, phone, email, service, message } = req.body;

  if (!name || !phone || !email) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Save to DB
  const sql = `INSERT INTO estimate_leads(name, phone, email, service, message) VALUES (?, ?, ?, ?, ?)`;
  db.query(sql, [name, phone, email, service, message], (err, result) => {
    if (err) {
      console.error("❌ DB Error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    // Send Email
    const mailOptions = {
      from: "info@kbinterio.com",
      to: "info@kbinterio.com",
      subject: `New Lead from ${name}`,
      html: `
        <h2>New Estimate Request</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Phone:</b> ${phone}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Service:</b> ${service}</p>
        <p><b>Message:</b> ${message}</p>
      `
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("❌ Email Error:", error);
        return res.status(500).json({ error: "Email sending failed" });
      }
      res.json({ success: true, message: "Estimate Submitted Succesfully !" });
    });
  });
});

// ====================== START SERVER ======================
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
