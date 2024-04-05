const startButton = document.getElementById('startButton');
  const stopButton = document.getElementById('stopButton');
  const video = document.getElementById('video');
  const recordedVideo = document.getElementById('recordedVideo');
  let mediaRecorder;
  let recordedBlobs;

  startButton.addEventListener('click', async () => {
    const stream = await navigator.mediaDevices.getUserMedia({video: true});
    video.srcObject = stream;

    // Specify MIME type for H.264 encoding if supported
    const options = MediaRecorder.isTypeSupported('video/mp4; codecs="avc1.42E01E"')
                    ? { mimeType: 'video/mp4; codecs="avc1.42E01E"' }
                    : { mimeType: 'video/webm' }; // Fallback to WebM if H.264 is not supported

    mediaRecorder = new MediaRecorder(stream, options);
    recordedBlobs = [];
    mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        recordedBlobs.push(event.data);
      }
    };
    mediaRecorder.start(10); // timeslice argument can be used to control the frequency of the 'dataavailable' event for long recordings
    console.log('MediaRecorder started', mediaRecorder);
    startButton.disabled = true;
    stopButton.disabled = false;
  });

  stopButton.addEventListener('click', () => {
    mediaRecorder.stop();
    video.srcObject.getTracks().forEach(track => track.stop()); // Stop video stream
    // Update the MIME type for the blob based on the actual recording settings
    const blob = new Blob(recordedBlobs, {type: mediaRecorder.mimeType});
    recordedVideo.src = URL.createObjectURL(blob);
    startButton.disabled = false;
    stopButton.disabled = true;
  });