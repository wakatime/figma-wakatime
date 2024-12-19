let apiKey: string = null,
  lastAction: number = 0,
  lastFile: string = undefined;

const VERSION = '1.0.0';

async function sendHeartbeat(file: string, project: string, isWrite: boolean) {
  if (apiKey != null) {
    let language = figma.editorType;
    let time = Date.now();

    figma.ui.postMessage({
      type: 'heartbeat',
      data: {
        file,
        time,
        project,
        language,
        isWrite,
        VERSION,
        apiKey,
      },
    });

    lastAction = time;
    lastFile = file;
  } else {
    await figma.clientStorage.getAsync('waka_time_api_key').then((myAPIKey) => {
      apiKey = myAPIKey;
      if (apiKey == null) {
        promptForAPIKey();
      } else {
        sendHeartbeat(file, project, isWrite);
      }
    });
  }
}

function enoughTimePassed() {
  return lastAction + 120000 < Date.now();
}

function promptForAPIKey(): void {
  figma.showUI(__html__);
  figma.ui.onmessage = (msg) => {
    if (msg.type === 'update-api-key') {
      figma.clientStorage.setAsync('waka_time_api_key', msg.apiKey);
      apiKey = msg.apiKey;
      figma.ui.hide();
    }
  };
}

async function checkAPIKey() {
  await figma.clientStorage.getAsync('waka_time_api_key').then((myAPIKey) => {
    apiKey = myAPIKey;
    if (apiKey == null) {
      promptForAPIKey();
    }
  });
}

async function handleActivity() {
  const file = `${figma.root.name}/${figma.currentPage.name}`;
  if (enoughTimePassed() || lastFile !== file) {
    sendHeartbeat(file, figma.root.name, false);
  }
}

function setupEventListeners() {
  figma.on('selectionchange', handleActivity);
  figma.on('documentchange', handleActivity);
  figma.on('currentpagechange', handleActivity);
  figma.on('close', handleActivity);
}

function initialize() {
  figma.showUI(__html__, { visible: false });
  checkAPIKey();
  setupEventListeners();
}

initialize();
