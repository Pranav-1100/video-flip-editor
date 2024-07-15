import React, { useRef, useEffect, useState } from 'react';

const RecordedSessionPreview = ({ recordedData, videoRef }) => {
  const canvasRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (recordedData.length === 0) return;

    const ctx = canvasRef.current.getContext('2d');
    const video = videoRef.current.getInternalPlayer();

    const drawFrame = () => {
      if (currentIndex >= recordedData.length) return;

      const frame = recordedData[currentIndex];
      video.currentTime = frame.timeStamp;
      video.playbackRate = frame.playbackRate;
      video.volume = frame.volume;

      video.addEventListener('seeked', () => {
        const [x, y, width, height] = frame.coordinates;
        ctx.drawImage(video, x, y, width, height, 0, 0, canvasRef.current.width, canvasRef.current.height);
        setCurrentIndex(prevIndex => prevIndex + 1);
      }, { once: true });
    };

    drawFrame();
  }, [recordedData, currentIndex, videoRef]);

  return (
    <div className="recorded-preview-container">
      <canvas ref={canvasRef} width="300" height="400" />
      <style jsx>{`
        .recorded-preview-container {
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        canvas {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }
      `}</style>
    </div>
  );
};

export default RecordedSessionPreview;