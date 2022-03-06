let changeColor = document.getElementById("wordFinder");
let autoJoiner = document.getElementById("autoJoiner");

wordFinder.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.webNavigation.getAllFrames({ tabId: tab.id }, function (frames) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id, frameIds: [frames[1].frameId] },
      function: injectWordFinder,
    });
  });
});

autoJoiner.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.webNavigation.getAllFrames({ tabId: tab.id }, function (frames) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id, frameIds: [frames[1].frameId] },
      function: injectAutoJoiner,
    });
  });
});

function injectWordFinder() {
  let scrabbleList = [];

  var xhr = new XMLHttpRequest();
  let url = chrome.runtime.getURL("wordlist.txt");

  xhr.open("GET", url, true);
  xhr.onreadystatechange = async function () {
    if (xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
      let data = xhr.responseText;
      scrabbleList = data.split("\n");

      while (true) {
        let syllable = document.getElementsByClassName("syllable")[0].innerHTML;

        if (syllable.includes("div")) {
          let old = syllable;
          while (true) {
            await new Promise((r) => setTimeout(r, 100));

            syllable = document.getElementsByClassName("syllable")[0].innerHTML;
            if (syllable !== old) break;
          }
        }

        let choices = [];

        let shortestWord = null;
        let shortestLength = Number.MAX_SAFE_INTEGER;

        for (let i = 0; i < scrabbleList.length; i++) {
          let word = scrabbleList[i];
          if (word.toUpperCase().includes(syllable.toUpperCase())) {
            choices.push(word);

            if (word.length < shortestLength) {
              shortestLength = word.length;
              shortestWord = word;
            }
          }
        }

        let fewChoices = [];

        for (let i = 0; i < 10; i++) {
          fewChoices.push(choices[(choices.length * Math.random()) | 0].trim());
        }

        document.getElementsByClassName(
          "syllable"
        )[0].innerHTML = `<div style="width: 100%; display: flex; justify-content: center; align-items: center; flex-direction: column">
          <div>${syllable}</div>
          <div style="width: 30%; text-shadow: 1px 0 0 #000, 0 -1px 0 #000, 0 1px 0 #000, -1px 0 0 #000;">[${shortestWord}, ${fewChoices.join(
          ", "
        )}]</div>
        </div>`;
      }
    }
  };
  xhr.send();
}

async function injectAutoJoiner() {
  while (true) {
    let joinButton = document.getElementsByClassName("styled joinRound")[0];

    if (joinButton) {
      joinButton.click();
    }

    await new Promise((r) => setTimeout(r, 10));
  }
}
