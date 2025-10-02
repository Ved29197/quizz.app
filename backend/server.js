const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
// const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(express.static(path.join(__dirname, '..', 'Frontend')));

// Connect to SQLite database
const db = new sqlite3.Database("./quiz.db");

// Create users table
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    username TEXT UNIQUE, 
    password TEXT,
    score INTEGER DEFAULT 0,
    high_score INTEGER DEFAULT 0
  )`);
});

// Routes

// Signup
app.post("/signup", (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.json({ success: false, message: "Username and password are required" });
  }

  db.run("INSERT INTO users (username, password) VALUES (?, ?)", [username, password], function(err) {
    if (err) {
      return res.json({ success: false, message: "Username already exists" });
    }
    res.json({ 
      success: true, 
      userId: this.lastID,
      message: "Account created successfully!" 
    });
  });
});

// Login
app.post("/login", (req, res) => {
  const { username, password } = req.body;
    console.log('Signup attempt:', username); // Add this line

  
  if (!username || !password) {
    return res.json({ success: false, message: "Username and password are required" });
  }

  db.get("SELECT * FROM users WHERE username = ? AND password = ?", [username, password], (err, row) => {
    if (err) {
            console.log('Signup error:', err.message); // Add this line
      return res.json({ success: false, message: "Error logging in" });
    }
        console.log('Signup successful for user:', username); // Add this line

    
    if (row) {
      res.json({ 
        success: true, 
        userId: row.id,
        username: row.username,
        score: row.score,
        highScore: row.high_score,
        message: "Login successful!"
      });
    } else {
      res.json({ success: false, message: "Invalid username or password" });
    }
  });
});

// Submit Score
app.post("/submit-score", (req, res) => {
  const { userId, score } = req.body;
  
  if (!userId || score === undefined) {
    return res.json({ success: false, message: "User ID and score are required" });
  }

  // Update score and high score
  db.run(`UPDATE users 
          SET score = ?, 
              high_score = MAX(COALESCE(high_score, 0), ?) 
          WHERE id = ?`, 
          [score, score, userId], function(err) {
    if (err) {
      console.error("Score update error:", err);
      return res.json({ success: false, message: "Error saving score" });
    }
    
    if (this.changes === 0) {
      return res.json({ success: false, message: "User not found" });
    }
    
    res.json({ 
      success: true, 
      message: "Score submitted successfully!",
      score: score
    });
  });
});

// Get Leaderboard
app.get("/leaderboard", (req, res) => {
  db.all("SELECT username, high_score as score FROM users WHERE high_score > 0 ORDER BY high_score DESC LIMIT 10", (err, rows) => {
    if (err) {
      return res.json({ success: false, message: "Error fetching leaderboard" });
    }
    
    res.json({ 
      success: true, 
      leaderboard: rows
    });
  });
});

// Get User Profile
app.get("/profile/:userId", (req, res) => {
  const userId = req.params.userId;
  
  db.get("SELECT id, username, score, high_score FROM users WHERE id = ?", [userId], (err, row) => {
    if (err) {
      return res.json({ success: false, message: "Error fetching profile" });
    }
    
    if (!row) {
      return res.json({ success: false, message: "User not found" });
    }
    
    res.json({ 
      success: true, 
      user: {
        id: row.id,
        username: row.username,
        score: row.score,
        highScore: row.high_score
      }
    });
  });
});

// Root route (should be after API routes)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../Frontend/index.html"));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});