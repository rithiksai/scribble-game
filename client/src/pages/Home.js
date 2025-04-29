// client/src/pages/Home.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Home() {
  // State to store the username and server status
  const [username, setUsername] = useState('');
  const [serverStatus, setServerStatus] = useState('Checking...');
  
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
      alert(`Welcome, ${username}!`);
      // We'll add more functionality here later
    }
  };

  return (
    <div className="home-container">
      <h1>Welcome to Scribble Game</h1>
      <p>Draw and guess with friends!</p>
      <div className="server-status">
        <p><small>Server Status: {serverStatus}</small></p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Your Name:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="Enter your name to play"
          />
        </div>
        <button type="submit">Start Playing</button>
      </form>
    </div>
  );
}

export default Home;