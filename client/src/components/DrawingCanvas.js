// client/src/components/DrawingCanvas.js
import React, { useRef, useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';

const DrawingCanvas = ({ roomId, isDrawer }) => {
  const canvasRef = useRef(null);
  const { socket } = useSocket();
  
  // Drawing state
  const [drawing, setDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  
  // Store previous position for drawing lines
  const prevPos = useRef({ x: 0, y: 0 });
  
  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // Fill with white background
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Set initial drawing style
    context.lineJoin = 'round';
    context.lineCap = 'round';
    context.strokeStyle = color;
    context.lineWidth = brushSize;
  }, [color, brushSize]);
  
  // Handle Socket.io events
  useEffect(() => {
    if (!socket) return;
    
    // Listen for drawing data from other users
    socket.on('draw-line', (data) => {
      const { from, to, color, brushSize } = data;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      // Set drawing style
      context.strokeStyle = color;
      context.lineWidth = brushSize;
      
      // Draw the line
      context.beginPath();
      context.moveTo(from.x, from.y);
      context.lineTo(to.x, to.y);
      context.stroke();
    });
    
    // Clean up on component unmount
    return () => {
      socket.off('draw-line');
    };
  }, [socket]);
  
  // Convert mouse position to canvas coordinates
  const getCanvasCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };
  
  // Handle mouse down event
  const handleMouseDown = (e) => {
    if (!isDrawer) return; // Only allow drawing if user is the drawer
    
    setDrawing(true);
    const pos = getCanvasCoordinates(e);
    prevPos.current = pos;
  };
  
  // Handle mouse move event
  const handleMouseMove = (e) => {
    if (!drawing || !isDrawer) return; // Only draw if mouse is down and user is drawer
    
    const currentPos = getCanvasCoordinates(e);
    
    // Draw on local canvas
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    context.beginPath();
    context.moveTo(prevPos.current.x, prevPos.current.y);
    context.lineTo(currentPos.x, currentPos.y);
    context.stroke();
    
    // Emit drawing data to server
    socket.emit('draw-line', {
      roomId: roomId,
      from: prevPos.current,
      to: currentPos,
      color: color,
      brushSize: brushSize
    });
    
    // Update previous position
    prevPos.current = currentPos;
  };
  
  // Handle mouse up event
  const handleMouseUp = () => {
    setDrawing(false);
  };
  
  // Handle mouse leaving canvas
  const handleMouseOut = () => {
    setDrawing(false);
  };
  
  // Color selection buttons
  const colors = ['#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
  
  // Brush size options
  const brushSizes = [2, 5, 10, 15, 20];
  
  // Clear canvas function
  const clearCanvas = () => {
    if (!isDrawer) return;
    
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Emit clear canvas event
    socket.emit('clear-canvas', { roomId });
  };
  
  return (
    <div className="drawing-container">
      <canvas
        ref={canvasRef}
        className="drawing-canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseOut={handleMouseOut}
        style={{
          cursor: isDrawer ? 'crosshair' : 'default',
          pointerEvents: isDrawer ? 'auto' : 'none'
        }}
      />
      
      {isDrawer && (
        <div className="drawing-controls">
          <div className="color-picker">
            {colors.map((c) => (
              <button
                key={c}
                className={`color-btn ${color === c ? 'selected' : ''}`}
                style={{ backgroundColor: c }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
          
          <div className="brush-sizes">
            {brushSizes.map((size) => (
              <button
                key={size}
                className={`brush-btn ${brushSize === size ? 'selected' : ''}`}
                onClick={() => setBrushSize(size)}
              >
                <div style={{ 
                  width: size, 
                  height: size, 
                  borderRadius: '50%',
                  backgroundColor: 'black',
                  margin: '0 auto'
                }} />
              </button>
            ))}
          </div>
          
          <button className="clear-btn" onClick={clearCanvas}>
            Clear Canvas
          </button>
        </div>
      )}
      
      {!isDrawer && (
        <div className="drawing-status">
          You are guessing - wait for your turn to draw
        </div>
      )}
    </div>
  );
};

export default DrawingCanvas;