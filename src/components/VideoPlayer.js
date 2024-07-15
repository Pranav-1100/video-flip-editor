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
  const [showCropper, setShowCropper] = useState(false);
  const [activeTab, setActiveTab] = useState('preview');
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

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="video-editor-modal">
      <div className="editor-header">
        <h2>Cropper</h2>
        <div className="tab-buttons-container">
          <div className="tab-buttons">
            <button
              className={activeTab === "preview" ? "active" : ""}
              onClick={() => setActiveTab("preview")}
            >
              Preview Session
            </button>
            <button
              className={activeTab === "generate" ? "active" : ""}
              onClick={() => setActiveTab("generate")}
            >
              Generate Session
            </button>
          </div>
        </div>
      </div>
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
            {showCropper && (
              <Cropper
                aspectRatio={aspectRatio}
                setCropperData={updateCropperData}
                containerRef={playerContainerRef}
              />
            )}
          </div>
          <div className="controls">
            <div className="progress-bar">
              <button onClick={() => setPlaying(!playing)}>
                {playing ? "❚❚" : "▶"}
              </button>
              <input
                type="range"
                min={0}
                max={duration}
                value={currentTime}
                onChange={(e) =>
                  videoRef.current.seekTo(parseFloat(e.target.value))
                }
              />
              <span>
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
            <div className="control-buttons">
            <button className='sound'>🔊</button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
              />
              <select
                className="playback-rate"
                value={playbackRate}
                onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
              >
                <option value={0.5}>0.5x</option>
                <option value={1}>1x</option>
                <option value={1.5}>1.5x</option>
                <option value={2}>2x</option>
              </select>
              <select
                className="aspect-ratio"
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value)}
              >
                {Object.keys(aspectRatios).map((ratio) => (
                  <option key={ratio} value={ratio}>
                    {ratio}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="action-buttons">
            <button
              className="start-cropper"
              onClick={() => setShowCropper(true)}
              disabled={showCropper}
            >
              Start Cropper
            </button>
            <button
              className="remove-cropper"
              onClick={() => setShowCropper(false)}
              disabled={!showCropper}
            >
              Remove Cropper
            </button>
            <button className="generate-preview" onClick={downloadJSON}>
              Generate Preview
            </button>
            <button className="cancel">Cancel</button>
          </div>
        </div>
        <div className="preview-section">
          <h3>Preview</h3>
          {showCropper ? (
            <Preview cropperData={cropperData} videoRef={videoRef} />
          ) : (
            <div className="preview-placeholder">
              <p>Preview not available</p>
              <p>
                Please click on "Start Cropper"
                <br />
                and then play video
              </p>
            </div>
          )}
        </div>
      </div>
      <style jsx>{`
        .video-editor-modal {
          background-color: #37393f;
          color: white;
          padding: 1.85%; /* 20px / 1082px */
          height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .editor-header {
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #37393f;
          padding: 10px;
          position: relative;
          border-bottom: 1px solid #444;
        }
        
        .editor-header h2 {
          margin: 0;
          margin-right: auto;
        }
        .editor-content {
          display: flex;
          flex: 1;
        }
        .tab-buttons-container {
          display: flex;
          justify-content: center;
          width: 100%;
          
        }
        .tab-buttons {
          display: flex;
          background-color: #45474e;
          padding: 3px;
          border-radius: 6px;
          justify-content: center;
          width: fit-content;
          margin: 0 auto;
          box-shadow: 0 4px 4px rgba(0, 0, 0, 0.2);
        }
        
        .tab-buttons button {
          margin-right: 10px;
          padding: 7px 10px;
          border: none;
          background-color: transparent;
          color: white;
          cursor: pointer;
          border-radius: 6px;
        }
        .tab-buttons button:last-child {
          margin-right: 0;
        }
        .tab-buttons button.active {
          background-color: #37393f;
        }
        
        .video-section {
          width: 42.51%; /* 460px / 1082px */
          display: flex;
          flex-direction: column;
        }
        
        .video-container {
          position: relative;
          width: 100%;
          height: 0;
          padding-top: 66.74%; /* 307px / 460px */
          background-color: black;
          border-radius: 8px;
          overflow: hidden;
        }
        
        .video-container > div {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        .controls {
          height: 6.89%; /* 46px / 668px */
          margin-top: 1.5%; /* 10px / 668px */
        }
        .progress-bar {
          display: flex;
          align-items: center;
          margin-bottom: 1.5%; /* 10px / 668px */
        }
        .progress-bar input {
          flex: 1;
          margin: 0 1.5%; /* 10px / 668px */
        }
        .control-buttons {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .playback-rate {
          width: 30%; /* 138px / 460px */
          height: 4.49%; /* 30px / 668px */
        }
        .aspect-ratio {
          width: 39.57%; /* 182px / 460px */
          height: 4.49%; /* 30px / 668px */
        }
        .action-buttons {
          display: flex;
          justify-content: space-between;
          margin-top: 1.5%; /* 10px / 668px */
        }
        .preview-section {
          width: 27.73%; /* 300px / 1082px */
          margin-left: 1.85%; /* 20px / 1082px */
        }
        @media (max-width: 768px) {
          .editor-content {
            flex-direction: column;
          }
          .video-section,
          .preview-section {
            width: 100%;
            margin-left: 0;
          }
          .preview-section {
            margin-top: 3%; /* 20px / 668px */
          }
        }
      `}</style>
    </div>
  );
};

export default VideoPlayer;