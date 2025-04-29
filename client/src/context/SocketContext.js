// client/src/context/SocketContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  
  useEffect(() => {
    // Create socket connection
    const SOCKET_SERVER = 'http://localhost:5000';
    const newSocket = io(SOCKET_SERVER, {
      autoConnect: true,
      reconnection: true
    });
    
    // Set up event listeners
    newSocket.on('connect', () => {
      console.log('Connected to socket server');
      setConnected(true);
    });
    
    newSocket.on('disconnect', () => {
      console.log('Disconnected from socket server');
      setConnected(false);
    });
    
    // Save socket to state
    setSocket(newSocket);
    
    // Clean up on component unmount
    return () => {
      console.log('Cleaning up socket connection');
      newSocket.disconnect();
    };
  }, []);
  
  // Create a value object with socket and connection status
  const value = {
    socket,
    connected
  };
  
  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};