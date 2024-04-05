const video = document.getElementById("video");

let faceDetectedCount = 0;
let faceNotDetectedCount = 0;
let mediaRecorder;
let recordedBlobs;
let faceDetectionInterval;
let currentTimeIn;
let currentPercentage;
const timelog = [];
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
  const options = await MediaRecorder.isTypeSupported('video/mp4; codecs="avc1.42E01E"')
                  ? { mimeType: 'video/mp4; codecs="avc1.42E01E"' }
                  : { mimeType: 'video/webm' };

  mediaRecorder = new MediaRecorder(stream, options);
  recordedBlobs = [];
  mediaRecorder.ondataavailable = (event) => {
    if (event.data && event.data.size > 0) {
      recordedBlobs.push(event.data);
    }
  };
  await mediaRecorder.start(10);

  // Start face detection
  startFaceDetection(video);

  console.log('MediaRecorder started', mediaRecorder);
}

async function startFaceDetection(video) {
  const labeledFaceDescriptors = await getLabeledFaceDescriptions();
  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors);

  const canvas = await faceapi.createCanvasFromMedia(video);
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
    timeIn();
    stopButton.disabled = false;
    startButton.disabled = true;
    startRecordingWithFaceDetection();
  });

  stopButton.addEventListener('click', () => {
    timeOut(currentPercentage);
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
  currentPercentage = percentage;
  document.getElementById("locked-in-percentage").textContent = percentage;
}
function timeIn(){
  currentTimeIn = new Date();
}
function timeOut(efficiency) {
  const currentTimeOut = new Date();

  // Assuming formatTime is a function that formats your Date objects
  const formattedIn = formatTime(currentTimeIn);
  const formattedOut = formatTime(currentTimeOut);

  // Add a new object to the timelog array
  timelog.push({
    currentTimeIn: formattedIn,
    currentTimeOut: formattedOut,
    efficiency: efficiency
  });

  // Call displayTimelog to update the log display
  displayTimelog();
}

function displayTimelog() {
  const logs = timelog; // Retrieve the array of timelog objects
  const container = document.getElementById('timelog-container');

  // Create a table or any other structure to display the timelog entries
  const table = document.createElement('table');
  if (timelog.length == 1){
  table.innerHTML = `
    <tr>
      <th>Time In</th>
      <th>Time Out</th>
      <th>Efficiency (%)</th>
    </tr>
  `;
  }

  if (logs.length > 0) {
    const lastLog = logs[logs.length - 1]; // Access the last item in the array
    
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${lastLog.currentTimeIn}</td>
      <td>${lastLog.currentTimeOut}</td>
      <td>${lastLog.efficiency}</td>
    `;
    table.appendChild(row); // Append only the last row
  }

  container.appendChild(table);
}
function formatTime(time){
    const formattedDate = time.toLocaleString('en-US', {
    month: 'numeric', // Numeric month
    day: 'numeric', // Numeric day
    year: 'numeric', // Numeric year
    hour: 'numeric', // Numeric hour without leading zero
    minute: '2-digit', // 2-digit minute
    second: '2-digit',
    hour12: false
  });
  return formattedDate;
}