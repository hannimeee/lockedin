const video = document.getElementById("video");

Promise.all([
  faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
  faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
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
  const labels = ["Dorn"];
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
    console.log(`Jaw: ${jaw}, Mouth: ${mouth}, Box Height: ${boxHeight}`);

    console.log(rxNumber,ryNumber);
    return {rxNumber,ryNumber};
}
video.addEventListener("play", async () => {
  const labeledFaceDescriptors = await getLabeledFaceDescriptions();
  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors);

  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);

  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);

  setInterval(async () => {
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

    const results = resizedDetections.map((d) => {
      return faceMatcher.findBestMatch(d.descriptor);
    });
    results.forEach((result, i) => {
      const box = resizedDetections[i].detection.box;
      const drawBox = new faceapi.draw.DrawBox(box, {
        label: result,
      });
      drawBox.draw(canvas);
    });
  }, 100);
});
