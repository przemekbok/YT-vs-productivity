// background scripts are for long state operationas of addon on browser window.

let stopwatchTime = 0; //time in seconds
let whitelist = []; //whitelist contains playlists id

let savedTabsUrls = [];

let isActive = false;

lookForRemoteTimer();

function activateBlocker() {
  isActive = true;

  getSavedWhitelist();
  changeIcon();
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

/*this code is never used anywhere*/
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
  changeIcon();
}
/*This is never used anywhere */
function startTimerManually(time) {
  setTimer(time * 1000);
  return new Promise(time => {
    setTimer(time * 1000);
    activateBlocker();
    changeIcon();
  });
}

function changeIcon() {
  if (isActive) {
    browser.browserAction.setIcon({
      path: {
        32: "icons/ytb-active-32.png"
      }
    });
  } else {
    browser.browserAction.setIcon({
      path: {
        32: "icons/ytb-base-32.png"
      }
    });
  }
}

function hideYoutubeTabs() {
  if (isActive) {
    browser.tabs.query({ url: "*://*.youtube.com/*" }).then(_tabs => {
      _tabs.forEach(tab => {
        if (!whitelist.some(listId => tab.url.includes(listId))) {
          savedTabsUrls.push(tab.url);
          browser.tabs.remove(tab.id);
        }
      });
    });
  }
}

function showYoutubeTabs() {
  if (!isActive) {
    savedTabsUrls.forEach(url => {
      browser.tabs.create({ url: url, discarded: true });
    });
  }
  savedTabsUrls = [];
}

function getSavedWhitelist() {
  browser.storage.local.get("whitelist").then(list => {
    whitelist = Object.values(list)[0] || [];
  });
}

function blockNewTab(tabId) {
  if (isActive) {
    browser.tabs.get(tabId).then(tab => {
      if (!whitelist.some(listId => tab.url.includes(listId))) {
        savedTabsUrls.push(tab.url);
        browser.tabs.remove(tab.id);
      }
    });
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

browser.runtime.onMessage.addListener(startTimer);
browser.tabs.onUpdated.addListener(blockNewTab, {
  urls: ["*://*.youtube.com/*"]
});
browser.runtime.onConnect.addListener(modifyPopup);
