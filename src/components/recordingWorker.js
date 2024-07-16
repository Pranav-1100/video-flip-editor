/* eslint-disable no-restricted-globals */

let recordedData = [];

self.addEventListener('message', (event) => {
  if (event.data.type === 'record') {
    console.log('Recording data:', event.data.data);
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
  } else if (event.data.type === 'getRecordedData') {
    console.log('Sending recorded data. Length:', recordedData.length);
    self.postMessage({
      type: 'recordedData',
      data: recordedData
    });
  }
});

/* eslint-enable no-restricted-globals */
