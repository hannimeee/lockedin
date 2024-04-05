let timer = null;
let [milliseconds, seconds, minutes, hours] = [0, 0, 0, 0];
let timerDisplay = document.getElementById("timerDisplay");

let timerRunning = false; // Track if the timer is running or paused

function startTimer_onClick() {
  if (!timerRunning) {
    timer = setInterval(stopwatchFunction, 10);
    timerRunning = true;
  }
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
  timerRunning = false;
}

function resetTimer() {
  clearInterval(timer);
  [milliseconds, seconds, minutes, hours] = [0, 0, 0, 0]; // Reset timer values
  timerDisplay.innerHTML = "00:00:00:00"; // Reset timer display
}