// components/Controls.js
import React from 'react';

const Controls = ({
  videoState,
  onPlayPause,
  onVolumeChange,
  onPlaybackRateChange,
  onAspectRatioChange
}) => {
  return (
    <div className="controls">
      <button onClick={onPlayPause}>
        {videoState.playing ? 'Pause' : 'Play'}
      </button>
      <input
        type="range"
        min="0"
        max="1"
        step="0.1"
        value={videoState.volume}
        onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
      />
      <select
        value={videoState.playbackRate}
        onChange={(e) => onPlaybackRateChange(parseFloat(e.target.value))}
      >
        <option value="0.5">0.5x</option>
        <option value="1">1x</option>
        <option value="1.5">1.5x</option>
        <option value="2">2x</option>
      </select>
      <select
        onChange={(e) => onAspectRatioChange(e.target.value)}
      >
        <option value="9:18">9:18</option>
        <option value="9:16">9:16</option>
        <option value="4:3">4:3</option>
        <option value="3:4">3:4</option>
        <option value="1:1">1:1</option>
        <option value="4:5">4:5</option>
      </select>
    </div>
  );
};

export default Controls;