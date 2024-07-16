import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Pause } from 'lucide-react';

const RecordedSession = ({ recordedData }) => {
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    if (recordedData && recordedData.length > 0) {
      setDuration(recordedData[recordedData.length - 1].timeStamp);
    }
  }, [recordedData]);

  const setupCanvas = useCallback(() => {
    const videoElement = videoRef.current;
    const canvasElement = canvasRef.current;
    if (videoElement && canvasElement) {
      const aspectRatio = videoElement.videoHeight / videoElement.videoWidth;
      const canvasWidth = 300; 
      const canvasHeight = canvasWidth * aspectRatio;
      canvasElement.width = canvasWidth;
      canvasElement.height = canvasHeight;
    }
  }, []);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.onloadedmetadata = () => {
        setVideoLoaded(true);
        setupCanvas();
      };
      videoElement.onerror = (e) => {
        console.error('Error loading video:', e);
      };
      videoElement.load();
    }
  }, [setupCanvas]);

  const drawFrame = useCallback(() => {
    if (!canvasRef.current || !videoRef.current || !videoLoaded || !recordedData || recordedData.length === 0) {
      return;
    }
  
    const ctx = canvasRef.current.getContext('2d');
    const currentData = recordedData.find(data => data.timeStamp >= currentTime) || recordedData[recordedData.length - 1];
    
    if (!currentData || !currentData.coordinates) {
      return;
    }
    
    const { coordinates, volume, playbackRate } = currentData;
    let [x, y, width, height] = coordinates;
    
    videoRef.current.volume = volume;
    videoRef.current.playbackRate = playbackRate;
    
    if (Math.abs(videoRef.current.currentTime - currentTime) > 0.1) {
      videoRef.current.currentTime = currentTime;
    }
    
    const videoWidth = videoRef.current.videoWidth;
    const videoHeight = videoRef.current.videoHeight;
    
    if (x < 0) {
      width = width + x; 
      x = 0; 
    }
    if (x + width > videoWidth) {
      width = videoWidth - x;
    }
    if (y + height > videoHeight) {
      height = videoHeight - y;
    }
    
    height = width * 1.18;
    
    const canvasWidth = canvasRef.current.width;
    const canvasHeight = canvasRef.current.height;
    
    const scaleX = videoWidth / canvasWidth;
    const scaleY = videoHeight / canvasHeight;
    
    const scaledX = x * scaleX;
    const scaledY = y * scaleY;
    const scaledWidth = width * scaleX;
    const scaledHeight = height * scaleY;
    
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(
      videoRef.current,
      scaledX, scaledY, scaledWidth, scaledHeight,
      0, 0, canvasWidth, canvasHeight
    );
  }, [currentTime, recordedData, videoLoaded]);

  useEffect(() => {
    let animationFrameId;
    const animate = () => {
      drawFrame();
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationFrameId);
  }, [drawFrame]);

  useEffect(() => {
    let intervalId;
    if (playing && videoRef.current) {
      videoRef.current.play().catch(e => console.error('Error playing video:', e));
      intervalId = setInterval(() => {
        setCurrentTime(prevTime => {
          const newTime = Math.min(prevTime + 0.1, duration);
          if (newTime >= duration) {
            setPlaying(false);
          }
          return newTime;
        });
      }, 100);
    } else {
      videoRef.current?.pause();
    }
    return () => clearInterval(intervalId);
  }, [playing, duration]);

  const handlePlayPause = () => {
    setPlaying(prev => !prev);
  };

  const handleScrubberChange = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="recorded-session">
      <div className="video-container">
        <canvas ref={canvasRef} />
        <video 
          ref={videoRef} 
          src="../../public/abcd.mp4" 
          style={{ display: 'none' }} 
          crossOrigin="anonymous"
          preload="auto"
          loop
        />
      </div>
      <div className="controls">
        <div className="progress-bar">
          <button className="play" onClick={handlePlayPause}>
            {playing ? <Pause /> : <Play />}
          </button>
          <input
            type="range"
            min={0}
            max={duration}
            value={currentTime}
            onChange={handleScrubberChange}
          />
        </div>
        <div className="secondline">
          <span>
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
      </div>
      <style jsx>{`
        .recorded-session {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .video-container {
          position: relative;
          width: 100%;
          padding-top: 56.25%; /* 16:9 aspect ratio */
          background-color: #000;
        }
        canvas {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        .controls {
          width: 100%;
          margin-top: 10px;
        }
        .progress-bar {
          display: flex;
          align-items: center;
          margin-bottom: 1.5%;
        }
        .progress-bar button {
          border: none;
          background-color: transparent;
          color: white;
          cursor: pointer;
        }
        .progress-bar input[type="range"] {
          -webkit-appearance: none;
          width: 100%;
          background: #3b3b3b;
          cursor: pointer;
          border: 1px solid #e8e6e3;
          border-radius: 20px;
          margin-left: 10px;
        }
        .progress-bar input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          background: white;
          border-radius: 50%;
          margin-top: -4px;
        }
        .secondline {
          display: flex;
          justify-content: space-between;
        }
      `}</style>
    </div>
  );
};

export default RecordedSession;
