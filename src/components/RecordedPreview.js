import React, { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player';

const RecordedPreview = ({ recordedData, videoUrl }) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const playerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const video = playerRef.current ? playerRef.current.getInternalPlayer() : null;
    if (!video) return;

    const drawCropper = () => {
      if (!video) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const currentRecord = recordedData.find(record => record.timeStamp <= currentTime);
      if (currentRecord) {
        const [x, y, width, height] = currentRecord.coordinates;
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.strokeRect(
          (x / 100) * video.videoWidth,
          (y / 100) * video.videoHeight,
          (width / 100) * video.videoWidth,
          (height / 100) * video.videoHeight
        );

        video.volume = currentRecord.volume;
        video.playbackRate = currentRecord.playbackRate;
      }
    };

    const animationId = requestAnimationFrame(drawCropper);
    return () => cancelAnimationFrame(animationId);
  }, [currentTime, recordedData]);

  const handleProgress = (state) => {
    setCurrentTime(state.playedSeconds);
  };

  return (
    <div style={{ position: 'relative' }}>
      <ReactPlayer
        ref={playerRef}
        url={videoUrl}
        playing={playing}
        onProgress={handleProgress}
        width="100%"
        height="auto"
      />
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none'
        }}
      />
      <button onClick={() => setPlaying(!playing)}>
        {playing ? 'Pause' : 'Play'}
      </button>
    </div>
  );
};

export default RecordedPreview;
