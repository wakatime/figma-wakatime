let apiKey     : string       = null,
    lastAction : number       = 0,
    lastFile   : string       = undefined;

const VERSION = '1.0.0';

async function sendHeartbeat (file : string, project : string, isWrite : boolean) {
  if (apiKey != null) {
    let language = figma.editorType;
    let time = Date.now();

    figma.ui.postMessage(
      {
        type: 'heartbeat',
        data: {
          file,
          time,
          project,
          language,
          isWrite,
          VERSION,
          apiKey,
        }
      }
    )

    lastAction = time;
    lastFile = file;
  } else {
    await figma.clientStorage.getAsync("waka_time_api_key").then(myAPIKey => {
      apiKey = myAPIKey;
      if (apiKey == null) {
        promptForAPIKey();
      } else {
        sendHeartbeat(file, project, isWrite);
      }
    })
  }
}

function enoughTimePassed() {
  return lastAction + 120000 < Date.now();
}

function promptForAPIKey () : void {
  figma.showUI(__html__);
  figma.ui.onmessage = msg => {
    if (msg.type === 'update-api-key') {
      figma.clientStorage.setAsync("waka_time_api_key", msg.apiKey);
      apiKey = msg.apiKey;
      figma.ui.hide();
    }
  }
}

async function checkAPIKey () {
  await figma.clientStorage.getAsync("waka_time_api_key").then(myAPIKey => {
    apiKey = myAPIKey;
    if (apiKey == null) {
      promptForAPIKey();
    }
  })
}

function setupEventListeners() {
  // -=- Handle Edits -=-
  figma.on(
    "selectionchange",
    () => {
      let file = `${figma.root.name}/${figma.currentPage.name}`
      if (enoughTimePassed() || lastFile !== file) {
        sendHeartbeat(file, figma.root.name, false)
      }
    }
  );

  // -=- Handle Page Saving's -=-
  figma.on(
    "currentpagechange",
    () => sendHeartbeat(`${figma.root.name}/${figma.currentPage.name}`, figma.root.name, true)
  )
  figma.on(
    "close",
    () => sendHeartbeat(`${figma.root.name}/${figma.currentPage.name}`, figma.root.name, true)
  );
}

function initialize() {
  // -=- Load The HTML -=-
  figma.showUI(__html__, {visible : false});

  // -=- Check For API Key Create A Prompt If It's Empty -=-
  checkAPIKey();

  // -=- Setup Event Listeners For File Changes -=-
  setupEventListeners();

  // -=- Implement The Users Preferences -=-
  // TODO: Load The Preferences
  // TODO: Create A UI For Hiding Files
  // TODO: Create A UI For Preferences
}


initialize();
