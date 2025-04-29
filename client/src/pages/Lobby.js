// client/src/pages/Lobby.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import axios from 'axios';

function Lobby() {
  const [rooms, setRooms] = useState([]);
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const { socket, connected } = useSocket();
  const navigate = useNavigate();
  
  // Get username from localStorage and fetch rooms on component mount
  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (!storedUsername) {
      // Redirect to home if no username is found
      navigate('/');
      return;
    }
    
    setUsername(storedUsername);
    fetchRooms();
  }, [navigate]);
  
  // Fetch active rooms from the server
  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/rooms');
      setRooms(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setLoading(false);
    }
  };
  
  // Create a new game room
  const createRoom = () => {
    // Generate a random room ID
    const newRoomId = 'room-' + Math.random().toString(36).substring(2, 8);
    
    // Navigate to the game room with action=create in URL
    navigate(`/game/${newRoomId}?action=create`);
  };
  
  // Join an existing room
  const joinRoom = (e) => {
    e.preventDefault();
    if (roomId.trim()) {
      // Navigate with action=join in URL
      navigate(`/game/${roomId}?action=join`);
    }
  };
  
  // Join directly from room list
  const joinExistingRoom = (id) => {
    // Navigate with action=join in URL
    navigate(`/game/${id}?action=join`);
  };
  
  // Refresh the list of rooms
  const handleRefresh = () => {
    fetchRooms();
  };
  
  return (
    <div className="lobby-container">
      <h1>Game Lobby</h1>
      <p className="welcome-message">Welcome, <strong>{username}</strong>!</p>
      
      <div className="connection-status">
        <p><small>Status: {connected ? 'Connected' : 'Connecting...'}</small></p>
      </div>
      
      <div className="lobby-actions">
        <div className="create-room">
          <h2>Create a New Game</h2>
          <button 
            onClick={createRoom} 
            disabled={!connected}
            className="create-button"
          >
            Create New Room
          </button>
        </div>
        
        <div className="join-room">
          <h2>Join Existing Room</h2>
          <form onSubmit={joinRoom}>
            <input 
              type="text" 
              placeholder="Enter Room ID" 
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              required
            />
            <button 
              type="submit" 
              disabled={!connected || !roomId.trim()}
              className="join-button"
            >
              Join Room
            </button>
          </form>
        </div>
      </div>
      
      <div className="available-rooms">
        <div className="room-header">
          <h2>Available Rooms</h2>
          <button onClick={handleRefresh} className="refresh-button">
            Refresh
          </button>
        </div>
        
        {loading ? (
          <p>Loading rooms...</p>
        ) : rooms.length === 0 ? (
          <p>No active game rooms found. Create one to start playing!</p>
        ) : (
          <ul className="room-list">
            {rooms.map((room) => (
              <li key={room.id} className="room-item">
                <div className="room-info">
                  <span className="room-id">Room: {room.id}</span>
                  <span className="player-count">{room.playerCount} players</span>
                </div>
                <button 
                  onClick={() => joinExistingRoom(room.id)}
                  className="join-room-button"
                >
                  Join
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Lobby;