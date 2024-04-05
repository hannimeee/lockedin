timer = null;
// let [milleseconds, seconds, minutes, hours] = [0,0,0,0];
let [milleseconds, seconds, minutes, hours] = [0,0,0,0];
let timerDisplay = document.getElementById("timerDisplay");


function stopwatchFunction() {
  milleseconds++;
   // ms
  seconds = Math.trunc(milleseconds/100)%60;//s
  minutes = Math.trunc(milleseconds/(100*60))%60; // minute
  hours = Math.trunc(milleseconds/(100*60*60)); //hour

  ms = milleseconds % 1000;
  s = seconds < 10 ? "0" + seconds : seconds;
  m = minutes < 10 ? "0" + minutes : minutes;
  h = hours < 10 ? "0" + hours : hours;

  timerDisplay.innerHTML = h + ":" + m + ":" + s + ":" + ((ms%100).toString().padStart(2, '0'));
}

// function stopwatchFunction() {
//   milleseconds++;
//   if (milleseconds == 100) {
//     seconds++
//     if (seconds == 60) {
//       minutes++
//       if (minutes == 60) {
//         hours++
//       }
//     }
//   }
//   timerDisplay.innerHTML = hours + ":" + minutes + ":" +  seconds + ":" + milleseconds%1000
// }

function startTimer_onClick() {
if (milleseconds == 0) { // Timer not running, start it
  timer = setInterval(stopwatchFunction, 10);
} else { // Timer running, reset it
  clearInterval(timer);
  [milliseconds, seconds, minutes, hours] = [0, 0, 0, 0]; // Reset timer values
  timerDisplay.innerHTML = "00:00:00:00"; // Reset timer display
  timer = setInterval(stopwatchFunction, 10);
}
}

function pauseTimer() {
  clearInterval(timer);

  seconds = Math.trunc(milleseconds/100)%60;//s
  minutes = Math.trunc(milleseconds/(100*60))%60; // minute
  hours = Math.trunc(milleseconds/(100*60*60)); //hour

  ms = milleseconds % 1000;
  s = seconds < 10 ? "0" + seconds : seconds;
  m = minutes < 10 ? "0" + minutes : minutes;
  h = hours < 10 ? "0" + hours : hours;

  timerDisplay.innerHTML = h + ":" + m + ":" + s + ":" + ((ms%100).toString().padStart(2, '0'));
}

function resetTimer() {
  clearInterval(timer);
  [milleseconds, seconds, minutes, hours] = [0, 0, 0, 0]; // Reset timer values
  timerDisplay.innerHTML = "00:00:00:00"; // Reset timer display
}   
