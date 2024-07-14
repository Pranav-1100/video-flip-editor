// recordingWorker.js
let recordedData = [];

// eslint-disable-next-line no-restricted-globals
self.onmessage = function(e) {
  if (e.data.type === 'record') {
    recordedData.push(e.data.data);
  } else if (e.data.type === 'download') {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(recordedData, null, 2));
    // eslint-disable-next-line no-restricted-globals
    self.postMessage(dataStr);
  }
};