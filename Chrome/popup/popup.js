let port = chrome.extension.connect({ name: "popup" });

(function initializeTimer() {
  let savedTimer;
  chrome.storage.local.get(["timer"], function(result) {
    savedTimer = Object.values(result)[0];
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
  chrome.runtime.sendMessage(timer);
  chrome.storage.local.set({ timer: timer });
  window.close();
}

function changeActive(msg) {
  if (JSON.parse(msg).active) {
    window.close();
  }
}

document.getElementById("apply").addEventListener("click", startTimer);
port.onMessage.addListener(changeActive);
