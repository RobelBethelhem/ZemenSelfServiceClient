import React, { useState, useRef, useEffect } from 'react';

const JustifiedText = ({ children }) => {
  const containerRef = useRef(null);
  const [paragraphs, setParagraphs] = useState([]);

  useEffect(() => {
    const updateParagraphs = () => {
      if (containerRef.current) {
        const container = containerRef.current;
        const containerWidth = container.offsetWidth;
        const childrenArray = React.Children.toArray(children);
        
        const newParagraphs = [];
        let currentParagraph = [];
        let currentLineWidth = 0;

        childrenArray.forEach((child, index) => {
          if (React.isValidElement(child) && child.type === 'br' || index === childrenArray.length - 1) {
            if (currentParagraph.length > 0) {
              newParagraphs.push(currentParagraph);
              currentParagraph = [];
              currentLineWidth = 0;
            }
          } else {
            const childWidth = getElementWidth(child);
            if (currentLineWidth + childWidth > containerWidth) {
              newParagraphs.push(currentParagraph);
              currentParagraph = [child];
              currentLineWidth = childWidth;
            } else {
              currentParagraph.push(child);
              currentLineWidth += childWidth;
            }
          }
        });

        if (currentParagraph.length > 0) {
          newParagraphs.push(currentParagraph);
        }

        setParagraphs(newParagraphs);
      }
    };

    const getElementWidth = (element) => {
      if (!React.isValidElement(element)) {
        return 0;
      }

      if (typeof element.type === 'string') {
        if (element.type === 'span') {
          const span = document.createElement('span');
          span.style.visibility = 'hidden';
          span.style.position = 'absolute';
          span.textContent = element.props.children;
          document.body.appendChild(span);
          const width = span.offsetWidth;
          document.body.removeChild(span);
          return width;
        } else if (element.type === 'input') {
          return 100; // Assuming a default width for inputs
        }
      } else if (typeof element.type === 'function') {
        // For custom components like AutoResizeInput
        return 100; // Assuming a default width for custom components
      }
      return 0;
    };

    updateParagraphs();
    window.addEventListener('resize', updateParagraphs);
    return () => window.removeEventListener('resize', updateParagraphs);
  }, [children]);

  return (
    <div ref={containerRef}>
      {paragraphs.map((paragraph, index) => (
        <div key={index} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: '8px' }}>
          {paragraph.map((element, elementIndex) => 
            React.isValidElement(element) ? React.cloneElement(element, {
              key: elementIndex,
              style: {
                ...(element.props.style || {}),
                marginRight: elementIndex < paragraph.length - 1 ? '4px' : '0',
              }
            }) : element
          )}
        </div>
      ))}
    </div>
  );
};

export default JustifiedText;