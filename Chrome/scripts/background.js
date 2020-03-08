// background scripts are for long state operationas of addon on browser window.

let stopwatchTime = 0; //time in seconds
let whitelist = []; //whitelist contains playlists id

let savedTabsUrls = [];

let isActive = false;

lookForRemoteTimer();

function activateBlocker() {
  isActive = true;
  changeIcon();
  getSavedWhitelist();
  hideYoutubeTabs();
  setTimeout(() => {
    isActive = false;
    changeIcon();
    showYoutubeTabs();
    lookForRemoteTimer();
  }, stopwatchTime);
}

function modifyPopup(port) {
  port.postMessage(JSON.stringify({ active: isActive }));
}

function evaluateTime(hours, minutes, seconds = 0) {
  let timeInSeconds =
    parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds);
  return timeInSeconds;
}

function addPlaylistToWhiteList(link) {
  let regex = /list=([a-zA-z0-9-])+/g;
  let parsedLink = link.match(regex);
  let listId = parsedLink ? parsetLink[0].split("list=")[0] : link;
  whitelist.push(listId);
}

function setTimer(timeInSeconds) {
  stopwatchTime = timeInSeconds;
}

function startTimer(message) {
  let time = evaluateTime(message.hours, message.minutes, message.seconds);
  setTimer(time * 1000);
  activateBlocker();
}

function changeIcon() {
  if (isActive) {
    chrome.browserAction.setIcon({
      path: {
        32: "icons/ytb-active-32.png"
      }
    });
  } else {
    chrome.browserAction.setIcon({
      path: {
        32: "icons/ytb-base-32.png"
      }
    });
  }
}

function hideYoutubeTabs() {
  if (isActive) {
    chrome.tabs.query({ url: "*://*.youtube.com/*" }, _tabs => {
      _tabs.forEach(tab => {
        if (!whitelist.some(listId => tab.url.includes(listId))) {
          savedTabsUrls.push(tab.url);
          chrome.tabs.remove(tab.id);
        }
      });
    });
  }
}

function showYoutubeTabs() {
  if (!isActive) {
    savedTabsUrls.forEach(url => {
      chrome.tabs.create({ url: url, active: false });
    });
  }
  savedTabsUrls = [];
}

function getSavedWhitelist() {
  chrome.storage.local.get("whitelist", list => {
    whitelist = Object.values(list)[0] || [];
  });
}

function blockNewTab(_, _, tab) {
  if (
    isActive &&
    tab.url.includes("youtube.com") &&
    !whitelist.some(listId => tab.url.includes(listId))
  ) {
    savedTabsUrls.push(tab.url);
    chrome.tabs.remove(tab.id);
  }
}

function lookForRemoteTimer() {
  return new Promise(() => {
    function pingTimer() {
      setTimeout(() => {
        fetch("http://localhost:3333/remoteTimer")
          .then(resp => {
            resp.json().then(json => {
              if (json.active && !isActive) {
                stopwatchTime = json["time remaining"];
                activateBlocker();
              } else {
                //TODO - deactivate timer
                pingTimer();
              }
            });
          })
          .catch(error => {
            if (!error.message.includes("TypeError")) console.log(error);
            pingTimer();
          });
      }, 250);
    }
    pingTimer();
  });
}

chrome.runtime.onMessage.addListener(startTimer);
chrome.tabs.onUpdated.addListener(blockNewTab);
chrome.extension.onConnect.addListener(modifyPopup);
