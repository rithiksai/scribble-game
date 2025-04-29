// client/src/pages/Home.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import axios from 'axios';

function Home() {
  const [username, setUsername] = useState('');
  const [serverStatus, setServerStatus] = useState('Checking...');
  const { connected } = useSocket();
  const navigate = useNavigate();
  
  // Check server connection when component mounts
  useEffect(() => {
    const checkServer = async () => {
      try {
        const response = await axios.get('http://localhost:5000/');
        setServerStatus('Connected! Server says: ' + response.data);
      } catch (error) {
        setServerStatus('Error connecting to server');
        console.error('Server connection error:', error);
      }
    };
    
    checkServer();
  }, []);
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      // Store username in localStorage
      localStorage.setItem('username', username);
      
      // Navigate to lobby page
      navigate('/lobby');
    }
  };
  
  return (
    <div className="home-container">
      <h1>Welcome to Scribble Game</h1>
      <p>Draw and guess with friends!</p>
      
      <div className="connection-status">
        <p><small>Server: {serverStatus}</small></p>
        <p><small>Socket: {connected ? 'Connected' : 'Disconnected'}</small></p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Choose a username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            minLength="3"
            maxLength="15"
            placeholder="3-15 characters"
          />
        </div>
        <button type="submit" disabled={!connected}>
          Enter Lobby
        </button>
      </form>
    </div>
  );
}

export default Home;