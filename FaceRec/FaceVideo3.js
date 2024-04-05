const video = document.getElementById("video");

let faceDetectedCount = 0;
let faceNotDetectedCount = 0;
let mediaRecorder;
let recordedBlobs;
let faceDetectionInterval;

Promise.all([
  faceapi.nets.ssdMobilenetv1.loadFromUri("./models"),
  faceapi.nets.faceRecognitionNet.loadFromUri("./models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("./models"),
]).then(startWebcam);

function startWebcam() {
  navigator.mediaDevices
    .getUserMedia({
      video: true,
      audio: false,
    })
    .then((stream) => {
      video.srcObject = stream;
    })
    .catch((error) => {
      console.error(error);
    });
}

function getLabeledFaceDescriptions() {
  const labels = ["PLUH"];
  return Promise.all(
    labels.map(async (label) => {
      const descriptions = [];
      for (let i = 1; i <= 1; i++) {
        const img = await faceapi.fetchImage(`./labels/${label}/${i}.png`);
        const detections = await faceapi
          .detectSingleFace(img)
          .withFaceLandmarks()
          .withFaceDescriptor();
        descriptions.push(detections.descriptor);
      }
      return new faceapi.LabeledFaceDescriptors(label, descriptions);
    })
  );
}
function getTop(l)
{
    return l.map((a) => a.y).reduce((a, b) => Math.min(a, b));
}

function getMeanPosition(l)
{
    return l.map((a) => [a.x, a.y]).reduce((a, b) => [a[0] + b[0], a[1] + b[1]]).map((a) => a / l.length);
}
function xyFaceDetect(detection)
{
    const { landmarks, detection: det } = detection; // Destructure for clarity
        
    const eyeRight = getMeanPosition(landmarks.getRightEye());
    const eyeLeft = getMeanPosition(landmarks.getLeftEye());
    const nose = getMeanPosition(landmarks.getNose());
    const mouth = getMeanPosition(landmarks.getMouth())[1];
    const jaw = getTop(landmarks.getJawOutline());
    
    const boxHeight = det.box.height;
    const boxWidth = det.box.width;

    const rx = (jaw - mouth) / boxHeight;
    const ry = (eyeLeft[0] + (eyeRight[0] - eyeLeft[0]) / 2 - nose[0]) / boxWidth;
    const ryNumber = parseFloat(ry.toFixed(3));
    const rxNumber = parseFloat(rx.toFixed(3));
    //console.log(`Jaw: ${jaw}, Mouth: ${mouth}, Box Height: ${boxHeight}`);

    //console.log(rxNumber,ryNumber);
    return {rxNumber,ryNumber};
}

async function startRecordingWithFaceDetection() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;

  // Specify MIME type for recording
  const options = MediaRecorder.isTypeSupported('video/mp4; codecs="avc1.42E01E"')
                  ? { mimeType: 'video/mp4; codecs="avc1.42E01E"' }
                  : { mimeType: 'video/webm' };

  mediaRecorder = new MediaRecorder(stream, options);
  recordedBlobs = [];
  mediaRecorder.ondataavailable = (event) => {
    if (event.data && event.data.size > 0) {
      recordedBlobs.push(event.data);
    }
  };
  mediaRecorder.start(10);

  // Start face detection
  startFaceDetection();

  console.log('MediaRecorder started', mediaRecorder);
}

async function startFaceDetection() {
  const labeledFaceDescriptors = await getLabeledFaceDescriptions();
  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors);

  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);

  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);

  faceDetectionInterval = setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video)
      .withFaceLandmarks()
      .withFaceDescriptors();
    const optimizedX = 0;
    const optimizedY = 0;
    const filteredDetections = detections.filter(detection => {
        const {rxNumber,ryNumber} = xyFaceDetect(detection);
        return ryNumber > optimizedY-0.5 && ryNumber < optimizedY + 0.5 && 
                rxNumber > optimizedX-0.5 && rxNumber < optimizedX + 0.5;
    });
    
    const resizedDetections = faceapi.resizeResults(detections, displaySize);

    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

    // Increment face detected or not detected counters
    if (filteredDetections.length > 0) {
      faceDetectedCount++;
    } else {
      faceNotDetectedCount++;
    }

    // Update the counters in the HTML
    document.getElementById("face-detected-count").innerText = faceDetectedCount;
    document.getElementById("face-not-detected-count").innerText = faceNotDetectedCount;
  
    const results = resizedDetections.map((d) => {
      return faceMatcher.findBestMatch(d.descriptor);
    });
    results.forEach((result, i) => {
      const box = resizedDetections[i].detection.box;
      const drawBox = new faceapi.draw.DrawBox(box, {
        label: result,
      });
      drawBox.draw(canvas);
    updateLockedInPercentage();
    });
  }, 100);
};
document.addEventListener('DOMContentLoaded', function() {
  // Assuming startButton and stopButton are the IDs of your buttons
  const startButton = document.getElementById('startButton');
  const stopButton = document.getElementById('stopButton');
  startButton.addEventListener('click', async () => {
    stopButton.disabled = false;
    startButton.disabled = true;
    startRecordingWithFaceDetection();
  });

  stopButton.addEventListener('click', () => {
    clearInterval(faceDetectionInterval);
    mediaRecorder.stop();
    video.srcObject.getTracks().forEach(track => track.stop()); // Stop video stream
    const blob = new Blob(recordedBlobs, {type: mediaRecorder.mimeType});
    recordedVideo.src = URL.createObjectURL(blob);
    startButton.disabled = false;
    stopButton.disabled = true;
  });
});
// Update the "Locked in %" stat
function updateLockedInPercentage() {
  const totalFrames = faceDetectedCount + faceNotDetectedCount;
  const percentage = totalFrames > 0 ? ((faceDetectedCount / totalFrames) * 100).toFixed(2) : 0;
  document.getElementById("locked-in-percentage").textContent = percentage;
}