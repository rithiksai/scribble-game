// client/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Import the Socket Provider
import { SocketProvider } from './context/SocketContext';

// Import pages
import Home from './pages/Home';
import Lobby from './pages/Lobby';
import GameRoom from './pages/GameRoom';

function App() {
  return (
    <SocketProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/lobby" element={<Lobby />} />
            <Route path="/game/:roomId" element={<GameRoom />} />
          </Routes>
        </div>
      </Router>
    </SocketProvider>
  );
}

export default App;