import React, { useState, useRef, useEffect } from 'react';

const AutoResizeInput = ({ placeholder, onChange }) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);
  const measureRef = useRef(null);

  useEffect(() => {
    adjustWidth();
  }, [inputValue]);

  const adjustWidth = () => {
    if (measureRef.current && inputRef.current) {
      const textWidth = measureRef.current.offsetWidth;
      inputRef.current.style.width = `${textWidth + 10}px`; // Add some padding
    }
  };

  const handleChange = (e) => {
    setInputValue(e.target.value);
    if (onChange) onChange(e);
  };

  return (
    <>
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        style={{
          minWidth: '20px',
          maxWidth: '100%',
          border: 'none',
          padding: 0,
          margin: 0,
          background: 'transparent',
          outline: 'none'
        }}
        placeholder={placeholder}
        onChange={handleChange}
      />
      <span
        ref={measureRef}
        style={{
          position: 'absolute',
          visibility: 'hidden',
          whiteSpace: 'pre',
          font: 'inherit',
          pointerEvents: 'none',
        }}
      >
        {inputValue || placeholder}
      </span>
    </>
  );
};

export default AutoResizeInput;