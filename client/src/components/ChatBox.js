// client/src/components/ChatBox.js
import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';

const ChatBox = ({ roomId, isDrawer }) => {
  const [messages, setMessages] = useState([]);
  const [guess, setGuess] = useState('');
  const { socket } = useSocket();
  const messagesEndRef = useRef(null);
  
  // Set up socket event listeners
  useEffect(() => {
    if (!socket) return;
    
    // Listen for player guesses
    socket.on('player-guess', (data) => {
      const { username, guess } = data;
      addMessage('guess', username, guess);
    });
    
    // Listen for system messages
    socket.on('system-message', (data) => {
      const { message } = data;
      addMessage('system', null, message);
    });
    
    // Listen for correct guesses
    socket.on('correct-guess', (data) => {
      const { username } = data;
      addMessage('correct', username, 'Guessed the word correctly!');
    });
    
    // Clean up on component unmount
    return () => {
      socket.off('player-guess');
      socket.off('system-message');
      socket.off('correct-guess');
    };
  }, [socket]);
  
  // Scroll to bottom of messages when new ones arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Helper function to add a message to the chat
  const addMessage = (type, username, content) => {
    setMessages(prevMessages => [
      ...prevMessages,
      { type, username, content, timestamp: new Date() }
    ]);
  };
  
  // Scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!guess.trim() || !socket) return;
    
    // Emit the guess to the server
    socket.emit('guess', {
      roomId,
      guess: guess.trim()
    });
    
    // Clear the input
    setGuess('');
  };
  
  return (
    <div className="chat-box">
      <div className="message-list">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.type}`}>
            {msg.type === 'system' ? (
              <div className="system-message">{msg.content}</div>
            ) : msg.type === 'correct' ? (
              <div className="correct-message">
                <span className="username">{msg.username}</span> {msg.content}
              </div>
            ) : (
              <div className="user-message">
                <span className="username">{msg.username}:</span> {msg.content}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="message-form">
        <input
          type="text"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          placeholder={isDrawer ? "You're drawing! Wait for others to guess" : "Type your guess here..."}
          disabled={isDrawer}
          className="message-input"
        />
        <button 
          type="submit" 
          disabled={isDrawer || !guess.trim()}
          className="send-button"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatBox;