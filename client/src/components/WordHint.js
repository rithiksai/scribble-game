// client/src/components/WordHint.js
import React from 'react';

const WordHint = ({ word, isDrawer }) => {
  // If user is the drawer, don't show dashes
  if (isDrawer) {
    return (
      <div className="word-hint">
        <span className="word-hint-label">Your word:</span>
        <span className="word-hint-text">{word}</span>
      </div>
    );
  }
  
  // If no word is provided, show nothing
  if (!word || word.length === 0) {
    return null;
  }
  
  // Create dashes for each letter
  const dashes = word.split('').map(() => '_').join(' ');
  
  return (
    <div className="word-hint">
      <span className="word-hint-label">Word:</span>
      <span className="word-hint-dashes">{dashes}</span>
      <span className="word-hint-length">({word.length} letters)</span>
    </div>
  );
};

export default WordHint;