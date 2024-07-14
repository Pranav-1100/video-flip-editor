// src/components/VideoPlayer.js
import React, { useState, useRef } from 'react';
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
  const videoRef = useRef(null);

  const recordData = () => {
    setRecordedData((prevData) => [
      ...prevData,
      {
        timeStamp: videoRef.current.getCurrentTime(),
        coordinates: [cropperData.x, cropperData.y, cropperData.width, cropperData.height],
        volume: volume,
        playbackRate: playbackRate
      }
    ]);
  };

  const downloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(recordedData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "recordedData.json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div style={{ display: 'flex' }}>
      <div style={{ position: 'relative', width: '70%', height: 'auto' }}>
        <ReactPlayer
          url="/abc.mp4"
          playing={playing}
          volume={volume}
          playbackRate={playbackRate}
          controls
          width="100%"
          height="100%"
          ref={videoRef}
        />
        <Cropper aspectRatio={aspectRatio} setCropperData={setCropperData} />
        <div>
          <button onClick={() => setPlaying(!playing)}>
            {playing ? 'Pause' : 'Play'}
          </button>
          <button onClick={() => setPlaybackRate(playbackRate - 0.5)}>Slower</button>
          <button onClick={() => setPlaybackRate(playbackRate + 0.5)}>Faster</button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
          />
          <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)}>
            {Object.keys(aspectRatios).map((ratio) => (
              <option key={ratio} value={ratio}>
                {ratio}
              </option>
            ))}
          </select>
          <button onClick={recordData}>Record Data</button>
          <button onClick={downloadJSON}>Generate Preview</button>
        </div>
      </div>
      <div style={{ width: '30%', padding: '10px' }}>
        <h2>Preview</h2>
        <Preview cropperData={cropperData} videoRef={videoRef} />
      </div>
    </div>
  );
};

export default VideoPlayer;
