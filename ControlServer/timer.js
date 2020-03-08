const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let hours = 0;
let minutes = 0;
let seconds = 0;

let startTimer;
let setTime;
let setActive;

function startCLI(timerFunc, time, active) {
  startTimer = timerFunc;
  setTime = time;
  setActive = active;
  initialQuestion();
}

function initialQuestion() {
  rl.question("Do you want to set timer's hours?(y/N)", answer => {
    if (answer.toLocaleUpperCase() === "N") {
      minutesQuestion();
    } else if (answer.toLowerCase() === "y") {
      hoursQuestion();
    } else {
      initialQuestion();
    }
  });
}

function hoursQuestion() {
  rl.question("Timer's hours:", answer => {
    if (!isNaN(answer) && answer <= 12 && answer >= 0) {
      hours = parseInt(answer);
      minutesQuestion();
    } else {
      hourQuestion();
    }
  });
}

function minutesQuestion() {
  rl.question("Timer's minutes:", answer => {
    if (!isNaN(answer) && answer <= 60 && answer >= 0) {
      minutes = parseInt(answer);
      secondsQuestion();
    } else {
      minutesQuestion();
    }
  });
}

function secondsQuestion() {
  rl.question("Timer's seconds:", answer => {
    if (!isNaN(answer) && answer <= 60 && answer >= 0) {
      seconds = parseInt(answer);
      runTimerLogic();
    }
  });
}

function repeatQuestion() {
  rl.question(
    "Do you want to repeat timer?(y/n) To quit simply press Ctrl + C\n",
    answer => {
      if (answer.toLowerCase() === "y") {
        runTimerLogic();
      } else {
        initialQuestion();
      }
    }
  );
}

function runTimerLogic() {
  let time = getTimeInSeconds() * 1000;
  setTime(time);
  setActive(true);
  startTimer();
  console.log(
    "Timer was set for " +
      hours +
      " hours, " +
      minutes +
      " minutes and " +
      seconds +
      " seconds."
  );
}

function getTimeInSeconds() {
  let timeInSeconds = hours * 3600 + minutes * 60 + seconds;
  return timeInSeconds;
}

module.exports = { startCLI, repeatQuestion };
