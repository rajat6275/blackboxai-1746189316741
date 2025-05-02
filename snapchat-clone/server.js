const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory data stores for demo purposes
const users = {};
const friends = {};
const streaks = {};
const stories = {};
const snaps = {};

// Basic routes for demo
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// In-memory user sessions
const sessions = {};

// Signup endpoint
app.post('/api/signup', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  if (users[username]) {
    return res.status(400).json({ error: 'Username already exists' });
  }
  users[username] = { password };
  friends[username] = [];
  streaks[username] = {};
  stories[username] = [];
  snaps[username] = [];
  return res.json({ message: 'Signup successful' });
});

// Login endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  const user = users[username];
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }
  // Create a simple session token
  const token = Math.random().toString(36).substr(2);
  sessions[token] = username;
  return res.json({ message: 'Login successful', token });
});

// WebSocket connection for real-time chat and snaps
wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    // Broadcast message to all connected clients
    wss.clients.forEach(client => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
