let timer = null;
let [milliseconds, seconds, minutes, hours] = [0, 0, 0, 0];
let timerDisplay = document.getElementById("timerDisplay");

let efficiencyTimer = 100;
let [percentageDec, percentageWhole] = [10000, 0];
let efficiencyNCV = document.getElementById("efficiencyNCV");
efficiencyNCV.innerHTML = "100.00%";

let timerRunning = false; // Track if the timer is running or paused

function startTimer_onClick() {
  if (!timerRunning) {
    timer = setInterval(stopwatchFunction, 10);
    eTimer = setInterval(efficiencyConstantDecrementFNC, 2000); // Decrease efficiency timer every 2 seconds
    timerRunning = true;
  }
}

function efficiencyConstantDecrementFNC() {
  percentageDec -= 15; // Decrease by 1.5%
  efficiencyNCV.innerHTML = Math.floor(percentageDec / 100) + "." + (percentageDec % 100).toString().padStart(2, '0') + "%";
}

function stopwatchFunction() {
  milliseconds++;
  seconds = Math.trunc(milliseconds / 100) % 60;
  minutes = Math.trunc(milliseconds / (100 * 60)) % 60;
  hours = Math.trunc(milliseconds / (100 * 60 * 60));

  let ms = milliseconds % 1000;
  let s = seconds < 10 ? "0" + seconds : seconds;
  let m = minutes < 10 ? "0" + minutes : minutes;
  let h = hours < 10 ? "0" + hours : hours;

  timerDisplay.innerHTML = h + ":" + m + ":" + s + ":" + ((ms % 100).toString().padStart(2, '0'));
}

function pauseTimer() {
  clearInterval(timer);
  clearInterval(eTimer);
  timerRunning = false;
}

function resetTimer() {
  clearInterval(timer);
  [milliseconds, seconds, minutes, hours] = [0, 0, 0, 0]; // Reset timer values
  timerDisplay.innerHTML = "00:00:00:00"; // Reset timer display

  clearInterval(eTimer);
  percentageDec = 0;
  efficiencyNCV.innerHTML = "100.00%";
  timerRunning = false;
}
