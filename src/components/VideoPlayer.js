import React, { useState, useRef, useCallback, useEffect } from 'react';
import ReactPlayer from 'react-player';
import Cropper from './Cropper';
import Preview from './Preview';

const aspectRatios = {
  '9:18': 9 / 18,
  '9:16': 9 / 16,
  '4:3': 4 / 3,
  '3:4': 3 / 4,
  '1:1': 1,
  '4:5': 4 / 5
};

const VideoPlayer = () => {
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [aspectRatio, setAspectRatio] = useState('9:16');
  const [cropperData, setCropperData] = useState({});
  const [recordedData, setRecordedData] = useState([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef(null);
  const playerContainerRef = useRef(null);
  const workerRef = useRef(null);

  useEffect(() => {
    workerRef.current = new Worker(new URL('./recordingWorker.js', import.meta.url));
    workerRef.current.onmessage = (event) => {
      setRecordedData(event.data);
    };

    return () => {
      workerRef.current.terminate();
    };
  }, []);

  const updateCropperData = useCallback((data) => {
    setCropperData(data);
    if (workerRef.current) {
      workerRef.current.postMessage({
        type: 'record',
        data: {
          timeStamp: videoRef.current.getCurrentTime(),
          coordinates: [data.x, data.y, data.width, data.height],
          volume: volume,
          playbackRate: playbackRate
        }
      });
    }
  }, [volume, playbackRate]);

  const handleProgress = useCallback((state) => {
    setCurrentTime(state.playedSeconds);
  }, []);

  const handleDuration = useCallback((duration) => {
    setDuration(duration);
  }, []);

  const downloadJSON = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'download' });
    }
  }, []);

  return (
    <div className="video-editor-modal">
      <div className="editor-content">
        <div className="video-section">
          <div className="video-container" ref={playerContainerRef}>
            <ReactPlayer
              url="/abc.mp4"
              playing={playing}
              volume={volume}
              playbackRate={playbackRate}
              width="100%"
              height="100%"
              ref={videoRef}
              onProgress={handleProgress}
              onDuration={handleDuration}
            />
            <Cropper
              aspectRatio={aspectRatio}
              setCropperData={updateCropperData}
              containerRef={playerContainerRef}
            />
          </div>
          <div className="controls">
            <button onClick={() => setPlaying(!playing)}>
              {playing ? 'Pause' : 'Play'}
            </button>
            <input
              type="range"
              min={0}
              max={duration}
              value={currentTime}
              onChange={(e) => videoRef.current.seekTo(parseFloat(e.target.value))}
            />
            <span>{Math.floor(currentTime)} / {Math.floor(duration)}</span>
            <select value={playbackRate} onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}>
              <option value={0.5}>0.5x</option>
              <option value={1}>1x</option>
              <option value={1.5}>1.5x</option>
              <option value={2}>2x</option>
            </select>
            <input
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
            />
            <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)}>
              {Object.keys(aspectRatios).map((ratio) => (
                <option key={ratio} value={ratio}>{ratio}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="preview-section">
          <Preview cropperData={cropperData} videoRef={videoRef} />
          <button onClick={downloadJSON}>Generate Preview</button>
        </div>
      </div>
      <style jsx>{`
        .video-editor-modal {
          display: flex;
          flex-direction: column;
          height: 100vh;
          width: 100vw;
        }
        .editor-content {
          display: flex;
          flex: 1;
        }
        .video-section {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 20px;
        }
        .video-container {
          position: relative;
          padding-top: 56.25%; /* 16:9 aspect ratio */
        }
        .video-container > div {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        .controls {
          margin-top: 20px;
        }
        .preview-section {
          flex: 1;
          padding: 20px;
          display: flex;
          flex-direction: column;
        }
      `}</style>
    </div>
  );
};

export default VideoPlayer;