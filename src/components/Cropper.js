// src/components/Cropper.js
import React, { useState, useRef, useEffect } from 'react';
import { Rnd } from 'react-rnd';

const aspectRatios = {
  '9:18': 9 / 18,
  '9:16': 9 / 16,
  '4:3': 4 / 3,
  '3:4': 3 / 4,
  '1:1': 1,
  '4:5': 4 / 5
};

const Cropper = ({ aspectRatio, setCropperData }) => {
  const [size, setSize] = useState({ width: 100, height: 100 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const cropperRef = useRef(null);

  useEffect(() => {
    const height = size.width / aspectRatios[aspectRatio];
    setSize({ ...size, height });
  }, [aspectRatio]);

  const onResize = (e, direction, ref, delta, position) => {
    setSize({
      width: ref.offsetWidth,
      height: ref.offsetHeight,
    });
    setPosition(position);
    setCropperData({ width: ref.offsetWidth, height: ref.offsetHeight, x: position.x, y: position.y });
  };

  const onDragStop = (e, d) => {
    setPosition({ x: d.x, y: d.y });
    setCropperData({ width: size.width, height: size.height, x: d.x, y: d.y });
  };

  return (
    <Rnd
      size={{ width: size.width, height: size.height }}
      position={{ x: position.x, y: position.y }}
      onDragStop={onDragStop}
      onResize={onResize}
      minHeight={50}
      minWidth={50}
      bounds="parent"
      ref={cropperRef}
    >
      <div style={{ border: '2px solid #000', width: '100%', height: '100%' }} />
    </Rnd>
  );
};

export default Cropper;
