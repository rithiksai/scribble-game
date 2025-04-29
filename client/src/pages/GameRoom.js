// client/src/pages/GameRoom.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import DrawingCanvas from '../components/DrawingCanvas';
import ChatBox from '../components/ChatBox';

function GameRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { socket, connected } = useSocket();
  
  const [username, setUsername] = useState('');
  const [players, setPlayers] = useState([]);
  const [isDrawer, setIsDrawer] = useState(false);
  const [currentWord, setCurrentWord] = useState('');
  const [gameStatus, setGameStatus] = useState('waiting'); // waiting, playing, ended
  const [timeLeft, setTimeLeft] = useState(0);
  
  // Get username from localStorage and join room on component mount
  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (!storedUsername) {
      // Redirect to home if no username is found
      navigate('/');
      return;
    }
    
    setUsername(storedUsername);
    
    // Only try to join room if socket is connected
    if (socket && connected) {
      // Check URL search parameters
      const urlParams = new URLSearchParams(window.location.search);
      const action = urlParams.get('action');
      
      console.log('Room action:', action);
      
      if (action === 'create') {
        // Create a new room
        createRoom(storedUsername);
      } else {
        // Default to joining a room
        joinRoom(storedUsername);
      }
    }
  }, [navigate, socket, connected]);
  
  // Create a new room
  const createRoom = (username) => {
    console.log('Creating new room:', roomId);
    socket.emit('create-room', { roomId, username });
  };
  
  // Join an existing room
  const joinRoom = (username) => {
    console.log('Joining room:', roomId);
    socket.emit('join-room', { roomId, username });
  };
  
  // Set up socket event listeners
  useEffect(() => {
    if (!socket) return;
    
    // Handle room joined event
    socket.on('room-joined', (data) => {
      setPlayers(data.players);
      console.log('Joined room: ', data);
    });
    
    // Handle player joined event
    socket.on('player-joined', (data) => {
      setPlayers(prev => [...prev, { id: data.playerId, username: data.username, score: 0 }]);
    });
    
    // Handle player left event
    socket.on('player-left', (data) => {
      setPlayers(prev => prev.filter(player => player.id !== data.playerId));
    });
    
    // Handle drawer selection
    socket.on('select-drawer', (data) => {
      setIsDrawer(data.drawerId === socket.id);
      setGameStatus('playing');
      
      // If you are the drawer, receive the word
      if (data.drawerId === socket.id && data.word) {
        setCurrentWord(data.word);
      } else {
        setCurrentWord(''); // Clear word for guessers
      }
    });
    
    // Handle round timer
    socket.on('time-left', (data) => {
      setTimeLeft(data.timeLeft);
    });
    
    // Handle round end
    socket.on('round-end', (data) => {
      setGameStatus('waiting');
      setIsDrawer(false);
      setCurrentWord(data.word); // Show the word to everyone
      setPlayers(data.players); // Update scores
    });
    
    // Handle errors
    socket.on('error', (data) => {
      alert(data.message);
      navigate('/lobby');
    });
    
    // Clean up on component unmount
    return () => {
      socket.off('room-joined');
      socket.off('player-joined');
      socket.off('player-left');
      socket.off('select-drawer');
      socket.off('time-left');
      socket.off('round-end');
      socket.off('error');
    };
  }, [socket, navigate]);
  
  // Format time left
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Leave the game room
  const leaveRoom = () => {
    navigate('/lobby');
  };
  
  return (
    <div className="game-room">
      <div className="game-header">
        <div className="room-info">
          <h1>Room: {roomId}</h1>
          <div className="connection-status">
            Status: {connected ? 'Connected' : 'Connecting...'}
          </div>
        </div>
        
        <div className="game-controls">
          {gameStatus === 'playing' && (
            <div className="timer">Time left: {formatTime(timeLeft)}</div>
          )}
          
          {isDrawer && currentWord && (
            <div className="current-word">
              Your word: <strong>{currentWord}</strong>
            </div>
          )}
          
          {gameStatus === 'waiting' && currentWord && (
            <div className="revealed-word">
              The word was: <strong>{currentWord}</strong>
            </div>
          )}
          
          <button onClick={leaveRoom} className="leave-button">
            Leave Room
          </button>
        </div>
      </div>
      
      <div className="game-container">
        <div className="main-area">
          <DrawingCanvas 
            roomId={roomId} 
            isDrawer={isDrawer} 
          />
        </div>
        
        <div className="sidebar">
          <div className="player-list">
            <h3>Players</h3>
            <ul>
              {players.map(player => (
                <li key={player.id} className={`player ${player.id === socket?.id ? 'current-player' : ''}`}>
                  <span className="player-name">
                    {player.username}
                    {player.id === socket?.id && ' (You)'}
                  </span>
                  <span className="player-score">{player.score}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <ChatBox 
            roomId={roomId} 
            isDrawer={isDrawer} 
          />
        </div>
      </div>
    </div>
  );
}

export default GameRoom;