let port = browser.runtime.connect({ name: "popup" });

(function initializeTimer() {
  let savedTimer;
  browser.storage.local
    .get("timer")
    .then(obj => {
      savedTimer = Object.values(obj)[0];
    })
    .finally(() => {
      if (typeof savedTimer != "undefined") {
        document.getElementById("hours").value = savedTimer.hours;
        document.getElementById("minutes").value = savedTimer.minutes;
        document.getElementById("seconds").value = savedTimer.seconds;
      }
    });
})();

function startTimer() {
  let hours = document.getElementById("hours").value;
  let minutes = document.getElementById("minutes").value;
  let seconds = document.getElementById("seconds").value;
  let timer = {
    hours: hours,
    minutes: minutes,
    seconds: seconds
  };
  browser.runtime.sendMessage(timer);
  browser.storage.local.set({ timer: timer });
  window.close();
}

function changeActive(msg) {
  if (JSON.parse(msg).active) {
    window.close();
  }
}

document.getElementById("apply").addEventListener("click", startTimer);
port.onMessage.addListener(changeActive);
