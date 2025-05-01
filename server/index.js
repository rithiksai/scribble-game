// server/index.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

// Create Express app
const app = express();
app.use(cors());
app.use(express.json());

// Create HTTP server with Express
const server = http.createServer(app);



const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
}); 
// Sample words for the game
const words = [
  'apple', 'banana', 'car', 'dog', 'elephant', 'fish', 'guitar', 'house',
  'igloo', 'jacket', 'kangaroo', 'lion', 'monkey', 'notebook', 'ocean',
  'pizza', 'queen', 'rabbit', 'snake', 'tree', 'umbrella', 'violin',
  'window', 'xylophone', 'yellow', 'zebra', 'castle', 'dragon', 'flower',
  'ghost', 'hamburger', 'island', 'jungle', 'kite', 'lamp', 'mountain'
];

// Store active game rooms
const rooms = {};

// Helper function to get a random word
function getRandomWord() {
  return words[Math.floor(Math.random() * words.length)];
}

// Helper function to get a player's username
function getPlayerUsername(roomId, playerId) {
  if (!rooms[roomId]) return 'Unknown';
  
  const player = rooms[roomId].players.find(p => p.id === playerId);
  return player ? player.username : 'Unknown';
}

// Helper function to start a new round
function startNewRound(roomId) {
  const room = rooms[roomId];
  if (!room) return;
  
  // Reset room state
  clearTimeout(room.timer);
  
  // If no players, don't start
  if (room.players.length < 2) {
    room.isActive = false;
    return;
  }
  
  // Select next drawer
  room.currentDrawerIndex = (room.currentDrawerIndex + 1) % room.players.length;
  const drawer = room.players[room.currentDrawerIndex];
  
  // Select a word
  const word = getRandomWord();
  room.currentWord = word;
  
  // Set room as active
  room.isActive = true;
  room.roundTime = 60; // 60 seconds per round
  
  // Notify clients about the new drawer
  io.to(roomId).emit('select-drawer', {
    drawerId: drawer.id,
    drawerUsername: drawer.username,
    wordLength: word.length  // Add word length for guessers
  });
  
  // Send the word only to the drawer
  io.to(drawer.id).emit('select-drawer', {
    drawerId: drawer.id,
    word: word
  });
  
  // Start the timer
  room.timer = setInterval(() => {
    room.roundTime -= 1;
    
    // Broadcast time left
    io.to(roomId).emit('time-left', { timeLeft: room.roundTime });
    
    // End round when time is up
    if (room.roundTime <= 0) {
      endRound(roomId);
    }
  }, 1000);
}

// Helper function to end a round
function endRound(roomId) {
  const room = rooms[roomId];
  if (!room) return;
  
  // Clear the timer
  clearTimeout(room.timer);
  
  // Notify clients that the round has ended
  io.to(roomId).emit('round-end', {
    word: room.currentWord,
    players: room.players
  });
  
  // Wait a bit before starting the next round
  setTimeout(() => {
    startNewRound(roomId);
  }, 5000);
}

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  // Handle creating a new room
  socket.on('create-room', (data) => {
    const { roomId, username } = data;
    
    // Create new room if it doesn't exist
    if (!rooms[roomId]) {
      rooms[roomId] = {
        id: roomId,
        players: [],
        currentWord: '',
        currentDrawerIndex: -1,
        isActive: false,
        roundTime: 0,
        timer: null
      };
    }
    
    // Add player to room
    rooms[roomId].players.push({
      id: socket.id,
      username,
      score: 0
    });
    
    // Join socket to room
    socket.join(roomId);
    
    // Save room ID on socket for later use
    socket.roomId = roomId;
    
    // Notify player they joined successfully
    socket.emit('room-joined', { 
      roomId, 
      players: rooms[roomId].players,
      isActive: rooms[roomId].isActive,
      currentDrawer: rooms[roomId].isActive ? rooms[roomId].players[rooms[roomId].currentDrawerIndex]?.id : null,
      timeLeft: rooms[roomId].roundTime || 0,
      wordLength: rooms[roomId].currentWord?.length || 0
    });

    // Notify other players in the room
    socket.to(roomId).emit('player-joined', {
      playerId: socket.id,
      username: username
    });
    
    console.log(`${username} created/joined room ${roomId}`);
    
    // Start a new round if enough players
    if (rooms[roomId].players.length >= 2 && !rooms[roomId].isActive) {
      startNewRound(roomId);
    }
  });
  
  // Handle joining an existing room
  socket.on('join-room', (data) => {
    const { roomId, username } = data;
    
    // Check if room exists
    if (!rooms[roomId]) {
      socket.emit('error', { message: 'Room does not exist' });
      return;
    }
    
    // Add player to room
    rooms[roomId].players.push({
      id: socket.id,
      username,
      score: 0
    });
    
    // Join socket to room
    socket.join(roomId);
    
    // Save room ID on socket for later use
    socket.roomId = roomId;
    
    // Notify player they joined successfully
    socket.emit('room-joined', { 
      roomId, 
      players: rooms[roomId].players 
    });
    
    // Notify other players in the room
    socket.to(roomId).emit('player-joined', {
      playerId: socket.id,
      username: username
    });
    
    console.log(`${username} joined room ${roomId}`);
    
    // Start a new round if enough players and not active
    if (rooms[roomId].players.length >= 2 && !rooms[roomId].isActive) {
      startNewRound(roomId);
    }
  });
  
  // Handle drawing data
  socket.on('draw-line', (data) => {
    if (socket.roomId) {
      // Broadcast drawing data to all users in the room except sender
      socket.to(socket.roomId).emit('draw-line', data);
    }
  });
  
  // Handle clearing the canvas
  socket.on('clear-canvas', (data) => {
    if (socket.roomId) {
      // Broadcast clear canvas command to all users in the room except sender
      socket.to(socket.roomId).emit('clear-canvas');
    }
  });
  
  // Handle player guesses
  socket.on('guess', (data) => {
    const { roomId, guess } = data;
    const room = rooms[roomId];
    
    if (!room) return;
    
    // Check if user is not the drawer
    const isDrawer = room.players[room.currentDrawerIndex]?.id === socket.id;
    if (isDrawer) return;
    
    // Get username
    const username = getPlayerUsername(roomId, socket.id);
    
    // Check if guess is correct
    const isCorrect = guess.toLowerCase() === room.currentWord.toLowerCase();
    
    // Broadcast the guess to all players
    io.to(roomId).emit('player-guess', {
      playerId: socket.id,
      username,
      guess,
      isCorrect
    });
    
    // If guess is correct
    if (isCorrect) {
      // Calculate score based on time left
      const scoreGained = Math.ceil(room.roundTime * 10);
      
      // Find player and update score
      const player = room.players.find(p => p.id === socket.id);
      if (player) {
        player.score += scoreGained;
      }
      
      // Reward drawer as well
      const drawer = room.players[room.currentDrawerIndex];
      if (drawer) {
        drawer.score += Math.ceil(scoreGained / 2);
      }
      
      // Notify everyone about correct guess
      io.to(roomId).emit('correct-guess', { username, scoreGained });
      
      // End this round
      endRound(roomId);
    }
  });

  // Handle system messages from clients
  socket.on('system-message', (data) => {
    const { roomId, message } = data;
    
    if (roomId && rooms[roomId]) {
      // Broadcast the system message to all users in the room
      io.to(roomId).emit('system-message', { message });
    }
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    
    // Remove player from their room if they're in one
    if (socket.roomId && rooms[socket.roomId]) {
      const roomId = socket.roomId;
      const room = rooms[roomId];
      
      // Get player index
      const playerIndex = room.players.findIndex(p => p.id === socket.id);
      
      // Check if disconnected player was the drawer
      const wasDrawer = playerIndex === room.currentDrawerIndex;
      
      // Filter out the disconnected player
      room.players = room.players.filter(player => player.id !== socket.id);
      
      // Adjust current drawer index if needed
      if (wasDrawer || (playerIndex < room.currentDrawerIndex && room.currentDrawerIndex > 0)) {
        room.currentDrawerIndex--;
      }
      
      // Notify other players
      io.to(roomId).emit('player-left', { playerId: socket.id });
      
      // End current round if drawer left or not enough players
      if (wasDrawer || room.players.length < 2) {
        clearTimeout(room.timer);
        room.isActive = false;
        
        // Send system message
        io.to(roomId).emit('system-message', { 
          message: wasDrawer 
            ? 'The drawer has left the game. Waiting for more players...' 
            : 'Not enough players to continue. Waiting for more players...'
        });
        
        // Start new round if still enough players
        if (room.players.length >= 2) {
          setTimeout(() => {
            startNewRound(roomId);
          }, 3000);
        }
      }
      
      // Clean up empty rooms
      if (room.players.length === 0) {
        delete rooms[roomId];
        console.log(`Room ${roomId} deleted (empty)`);
      }
    }
  });
});

// Basic route for testing
app.get('/', (req, res) => {
  res.send('Scribble Game Server is running!');
});

// API route to get list of rooms
app.get('/api/rooms', (req, res) => {
  // Return a sanitized list of rooms (without sensitive data)
  const roomList = Object.values(rooms).map(room => ({
    id: room.id,
    playerCount: room.players.length,
    isActive: room.isActive
  }));
  
  res.json(roomList);
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});