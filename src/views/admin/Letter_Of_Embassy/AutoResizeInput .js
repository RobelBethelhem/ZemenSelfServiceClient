import React, { useState, useRef, useEffect } from 'react';
import { CFormInput } from '@coreui/react';

const AutoResizeInput = (props) => {
  const [inputWidth, setInputWidth] = useState(0);
  const inputRef = useRef(null);
  const hiddenTextRef = useRef(null);

  useEffect(() => {
    updateInputWidth();
  }, [props.value]);

  const updateInputWidth = () => {
    if (hiddenTextRef.current) {
      const hiddenTextWidth = hiddenTextRef.current.offsetWidth;
      setInputWidth(hiddenTextWidth + 10);
    }
  };

  return (
    <>
      <div
        ref={hiddenTextRef}
        style={{
          position: 'absolute',
          visibility: 'hidden',
          whiteSpace: 'pre',
          fontFamily: 'inherit',
          fontSize: 'inherit',
          fontWeight: 'inherit',
        }}
      >
        {props.value || props.placeholder}
      </div>
      <CFormInput
        {...props}
        ref={inputRef}
        style={{ ...props.style, width: `${inputWidth}px`, minWidth: '50px' }}
      />
    </>
  );
};

export default AutoResizeInput;