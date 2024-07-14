import React, { useState, useEffect, useCallback } from 'react';

const aspectRatios = {
  '9:18': 9 / 18,
  '9:16': 9 / 16,
  '4:3': 4 / 3,
  '3:4': 3 / 4,
  '1:1': 1,
  '4:5': 4 / 5
};

const Cropper = ({ aspectRatio, setCropperData, containerRef }) => {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (containerRef.current) {
      const containerHeight = containerRef.current.offsetHeight;
      const containerWidth = containerRef.current.offsetWidth;
      const newWidth = containerHeight * aspectRatios[aspectRatio];
      
      setSize({
        width: Math.min(newWidth, containerWidth),
        height: containerHeight
      });
      
      setPosition({
        x: (containerWidth - Math.min(newWidth, containerWidth)) / 2,
        y: 0
      });
    }
  }, [aspectRatio, containerRef]);

  useEffect(() => {
    setCropperData({ ...size, ...position });
  }, [size, position, setCropperData]);

  const handleMouseDown = useCallback((e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  }, [position]);

  const handleMouseMove = useCallback((e) => {
    if (isDragging && containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const newX = Math.max(0, Math.min(e.clientX - dragStart.x, containerWidth - size.width));
      setPosition(prev => ({ ...prev, x: newX }));
    }
  }, [isDragging, dragStart, size.width, containerRef]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div
      style={{
        width: `${size.width}px`,
        height: `${size.height}px`,
        border: '2px solid #fff',
        position: 'absolute',
        top: '0',
        left: '0',
        transform: `translateX(${position.x}px)`,
        cursor: 'move',
      }}
      onMouseDown={handleMouseDown}
    />
  );
};

export default Cropper;