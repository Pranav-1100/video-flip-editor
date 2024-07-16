import React, { useState, useRef, useCallback, useEffect } from "react";
import ReactPlayer from "react-player";
import Cropper from "./Cropper";
import Preview from "./Preview";
import RecordedSession from "./RecordedSession";
import {
  Pause,
  Play,
  SquarePlay,
  Volume2,
  Youtube,
  YoutubeIcon,
} from "lucide-react";

const aspectRatios = {
  "9:18": 9 / 18,
  "9:16": 9 / 16,
  "4:3": 4 / 3,
  "3:4": 3 / 4,
  "1:1": 1,
  "4:5": 4 / 5,
};

const VideoPlayer = () => {
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [aspectRatio, setAspectRatio] = useState("9:16");
  const [cropperData, setCropperData] = useState({});
  const [recordedData, setRecordedData] = useState([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showCropper, setShowCropper] = useState(false);
  const [activeTab, setActiveTab] = useState("preview");
  const videoRef = useRef(null);
  const playerContainerRef = useRef(null);
  const workerRef = useRef(null);


  useEffect(() => {
    workerRef.current = new Worker(
      new URL("./recordingWorker.js", import.meta.url)
    );
    workerRef.current.onmessage = (event) => {
      if (event.data.type === 'recordedData') {
        console.log('Received recorded data from worker. Length:', event.data.data.length);
        setRecordedData(event.data.data);
      }
      if (event.data.type === "download") {
        const a = document.createElement("a");
        a.href = event.data.url;
        a.download = event.data.filename;
        a.click();
        URL.revokeObjectURL(event.data.url);
      }
      
    };

    return () => {
      workerRef.current.terminate();
    };
  }, []);

  const updateCropperData = useCallback(
    (data) => {
      setCropperData(data);
    if (workerRef.current) {
      console.log('Sending data to worker:', data);
      workerRef.current.postMessage({
        type: "record",
        data: {
          timeStamp: videoRef.current.getCurrentTime(),
          coordinates: [data.x, data.y, data.width, data.height],
          volume: volume,
          playbackRate: playbackRate,
        },
      });
    }
  },
    [volume, playbackRate]
  );

  const handleProgress = useCallback((state) => {
    setCurrentTime(state.playedSeconds);
  }, []);

  const handleDuration = useCallback((duration) => {
    setDuration(duration);
  }, []);

  const downloadJSON = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.postMessage({ type: "download" });
    }
  }, []);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'generate' && workerRef.current) {
      console.log('Requesting recorded data from worker');
      workerRef.current.postMessage({ type: 'getRecordedData' });
    }
  };
  return (
    <div className="video-editor-modal">
      <div className="editor-header">
        <h2>Cropper</h2>
        <div className="tab-buttons">
          <button
            className={activeTab === "preview" ? "active" : ""}
            onClick={() => handleTabChange("preview")}
          >
            Preview Session
          </button>
          <button
            className={activeTab === "generate" ? "active" : ""}
            onClick={() => handleTabChange("generate")}
          >
            Generate Session
          </button>
        </div>
      </div>
      <div className="editor-content">
        <div className="video-section">
          <div className="video-container" ref={playerContainerRef}>
            <ReactPlayer
              url="/abcd.mp4"
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
              <button className="play" onClick={() => setPlaying(!playing)}>
                {playing ? <Pause /> : <Play />}
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
            </div>
            <div className="secondline">
              <span>
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
              <div className="soundarea">
                <button className="sound">
                  <Volume2 />
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                />
              </div>
            </div>
            <div className="control-buttons">
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
        </div>
        <div className="preview-section">
          <h3>Preview</h3>
          <div className="preview-content">
            {activeTab === "preview" ? (
              showCropper ? (
                <div className="small-preview">
                  <Preview cropperData={cropperData} videoRef={videoRef} />
                </div>              
                ) : (
                <div className="preview-placeholder">
                  <div className="preview-icon">
                    <YoutubeIcon />
                  </div>
                  <p>Preview not available</p>
                  <p>
                    Please click on "Start Cropper"
                    <br />
                    and then play video
                  </p>
                </div>
              )
            ) : (
              console.log("recordedData in VideoPlayer:", recordedData),
              <RecordedSession recordedData={recordedData} />
            )}
          </div>
        </div>
      </div>
      <div className="action-buttons">
        <div className="actions-1">
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
        </div>
        <button className="cancel">Cancel</button>
      </div>
      <style jsx>{`
        .video-editor-modal {
          justify-content: center;
          items-align: center;
          min-height: screen-height;
          background-color: #37393f;
          color: white;
          padding: 20px; /* 20px / 1082px */
          // height: 100vh;
          display: flex;
          flex-direction: column;
          width: 1082px;
          height: 700px;
          border: 1px solid #6f675b;
          border-radius: 8px;
        }
        .editor-header {
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #37393f;
          padding: 6px;
          position: relative;
          border-bottom: 1px solid #444;
        }

        .editor-header h2 {
          margin: 0;
          font-size: 1.6rem;
          font-weight: 500;
        }
        .editor-content {
          display: flex;
          flex: 1;
          padding: 10px;
        }
        .tab-buttons-container {
          display: flex;
          justify-content: center;
          width: 100%;
        }
        .tab-buttons {
          margin-left: auto;
          display: flex;
          background-color: #45474e;
          padding: 3px;
          border-radius: 6px;
          justify-content: center;
          width: fit-content;
          margin: 0 auto;
          box-shadow: 0 4px 4px rgba(0, 0, 0, 0.2);
          overflow: hidden;
        }

        .tab-buttons button {
          margin-right: 10px;
          padding: 7px 10px;
          border: none;
          background-color: transparent;
          color: white;
          cursor: pointer;
          border-radius: 6px;
          display: flex;
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
          padding-top: 56.8%; /* 307px / 460px */
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
          margin-top: 10px;
          // height: 6.89%; /* 46px / 668px */
        }
        .progress-bar {
          display: flex;
          align-items: center;
          margin-bottom: 1.5%; /* 10px / 668px */
        }
        .progress-bar button {
          border: none;
          background-color: transparent;
          color: white;
          cursor: pointer;
        }
        .control-buttons button {
          border: none;
          background-color: transparent;
          color: white;
          cursor: pointer;
        }
        .control-buttons select,
        .control-buttons input[type="range"] {
          margin-right: 10px;
          background-color: transparent;
          color: white;
        }
        .control-buttons option {
          color: black;
          background-color: transparent;
        }
        .secondline {
          display: flex;
          justify-content: space-between;
        }
        .sound {
          background-color: transparent;
          border: none;
          color: white;
          cursor: pointer;
        }
        .soundarea input[type="range"] {
          -webkit-appearance: none;
          width: 70%;
          background: #3b3b3b;
          cursor: pointer;
          border: 1px solid #e8e6e3;
          border-radius: 20px;
        }

        .soundarea input[type="range"]::-webkit-slider-runnable-track {
          width: 100%;
          height: 8px;
          background: #3b3b3b;
          border-radius: 5px;
        }

        .soundarea input[type="range"]::-moz-range-track {
          width: 100%;
          height: 8px;
          background: white;
          border-radius: 5px;
        }

        .soundarea input[type="range"]::-ms-track {
          width: 100%;
          height: 8px;
          background: transparent;
          border-color: transparent;
          color: transparent;
        }

        .soundarea input[type="range"]::-ms-fill-lower {
          background: white;
          border-radius: 5px;
        }

        .soundarea input[type="range"]::-ms-fill-upper {
          background: white;
          border-radius: 5px;
        }

        .soundarea input[type="range"]::-ms-thumb {
          width: 16px;
          height: 16px;
          background: white;
          border-radius: 50%;
          border: none;
        }

        .soundarea input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          background: white;
          border-radius: 50%;
          margin-top: -4px;
        }

        .soundarea input[type="range"]::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: white;
          border-radius: 50%;
          border: none;
        }

        .progress-bar input,
        .control-buttons input[type="range"] {
          -webkit-appearance: none;
          width: 100%;
          background: #3b3b3b;
          cursor: pointer;
          border: 1px solid #e8e6e3;
          border-radius: 20px;
        }
        .progress-bar input::-webkit-slider-runnable-track,
        .control-buttons input[type="range"]::-webkit-slider-runnable-track {
          width: 100%;
          height: 8px;
          background: #3b3b3b;
          border-radius: 5px;
        }
        .progress-bar input:focus,
        .control-buttons input[type="range"]:focus {
          outline: none;
        }

        .progress-bar input::-moz-range-track,
        .control-buttons input[type="range"]::-moz-range-track {
          width: 100%;
          height: 8px;
          background: white;
          border-radius: 5px;
        }

        .progress-bar input::-moz-range-thumb,
        .control-buttons input[type="range"]::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: white;
          border-radius: 50%;
          border: none;
        }

        .progress-bar input::-ms-track,
        .control-buttons input[type="range"]::-ms-track {
          width: 100%;
          height: 8px;
          background: transparent;
          border-color: transparent;
          color: transparent;
        }

        .progress-bar input::-ms-fill-lower,
        .control-buttons input[type="range"]::-ms-fill-lower {
          background: white;
          border-radius: 5px;
        }

        .progress-bar input::-ms-fill-upper,
        .control-buttons input[type="range"]::-ms-fill-upper {
          background: white;
          border-radius: 5px;
        }

        .progress-bar input::-ms-thumb,
        .control-buttons input[type="range"]::-ms-thumb {
          width: 16px;
          height: 16px;
          background: white;
          border-radius: 50%;
          border: none;
        }
        .progress-bar input::-webkit-slider-thumb,
        .control-buttons input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          background: white;
          border-radius: 50%;
          margin-top: -4px;
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
        .preview-section {
          width: 26.73%; /* 300px / 1082px */
          margin-left: 10.85%; /* 20px / 1082px */
          flex: 1;
          background-color: #37393f;
          border-radius: 8px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-width: 0;
        }

        .preview-content {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          width: 100%;
        }

        .small-preview {
          width: 80%;
          max-width: 240px;
          aspect-ratio: 9 / 18;
          overflow: hidden;
          border-radius: 8px;
        }
        .preview-placeholder {
          text-align: center;
          color: #999;
        }
        
        .preview-icon {
          font-size: 48px;
          margin-bottom: 20px;
        }
        .action-buttons {
          display: flex;
          justify-content: space-between;
          padding: 20px;
          border-top: 1px solid #444;
        }
        .actions-1 {
          display: flex;
          gap: 10px;
          margin-right: 10px;
        }
        .action-buttons button {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          background-color: #6c5ce7;
          color: white;
        }
        .action-buttons button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .action-buttons button.cancel {
          background-color: #45474e;
          border: 1px solid #6c5ce7;
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
