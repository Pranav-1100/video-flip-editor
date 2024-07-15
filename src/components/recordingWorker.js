/* eslint-disable no-restricted-globals */
let recordedData = [];

// Listen for messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data.type === 'record') {
    recordedData.push(event.data.data);
  } else if (event.data.type === 'download') {
    const blob = new Blob([JSON.stringify(recordedData, null, 2)], {type : 'application/json'});
    self.postMessage({
      type: 'download',
      url: URL.createObjectURL(blob),
      filename: 'recorded_session.json'
    });
  } else if (event.data.type === 'clear') {
    recordedData = [];
  }
});

// Send the current recordedData back to the main thread
self.postMessage(recordedData);