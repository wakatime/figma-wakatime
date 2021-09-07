let apiKey     : string       = null,
    lastAction : number       = 0,
    lastFile   : string       = undefined; 

const VERSION = '1.0.0';

async function sendHeartbeat (file : string, time : number, project : string, isWrite : boolean, lines : number) {
  if (apiKey != null) {
    let language = figma.editorType;

    figma.showUI(__html__, {visible : false});
    figma.ui.postMessage(
      { 
        type: 'heartbeat', 
        data: {
          file,
          time,
          project,
          language,
          isWrite,
          lines,
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

function initialize() {
  // -=- Check For API Key Create A Prompt If It's Empty -=-
  checkAPIKey();

  // -=- Send Test Heartbeat -=-
  sendHeartbeat("./test", 1000, "Figma-Test-Project", true, 100); // FIXME: Causes a 405 error (not sure why)

  // -=- Setup Event Listeners For File Changes -=-
  // TODO: Setup Event Listeners To Wait For The figma.viewport.center or figma.viewport.bounds
}


initialize()