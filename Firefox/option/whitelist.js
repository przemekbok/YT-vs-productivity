(function initializeWishlsit() {
  let items = [];
  browser.storage.local
    .get("whitelist")
    .then(list => {
      items = Object.values(list)[0] || [];
    })
    .finally(() => {
      let whitelist = document.getElementById("whitelist");

      items.forEach(element => {
        let option = document.createElement("option");
        option.text = element;
        whitelist.add(option);
      });
    });
})();

function saveDataFromWhitelist() {
  let whitelist = document.getElementById("whitelist");
  let items = [];
  for (let i = 0; i < whitelist.length; i++) {
    items.push(whitelist[i].text);
  }
  browser.storage.local.set({ whitelist: items });
}

function addItemToWhitelist() {
  let elementstext = document.getElementById("wishlistInput").value;
  let whitelist = document.getElementById("whitelist");
  let option = document.createElement("option");
  option.text = elementstext;
  whitelist.add(option);
  saveDataFromWhitelist();
}

function removeItemFromWhitelist() {
  let whitelist = document.getElementById("whitelist");
  whitelist.remove(whitelist.selectedIndex);
  saveDataFromWhitelist();
}

document.getElementById("apply").addEventListener("click", addItemToWhitelist);
document
  .getElementById("whitelist")
  .addEventListener("dblclick", removeItemFromWhitelist);
