function promptForAPIKey () : void {
  figma.showUI(__html__);
  figma.ui.onmessage = msg => {
    if (msg.type === 'update-api-key') {
      const apiKey = msg.apiKey;
      figma.clientStorage.setAsync("waka_time_api_key", apiKey);
      figma.ui.close();
    }
  }
}

async function checkAPIKey () {
  await figma.clientStorage.getAsync("waka_time_api_key").then(apiKey => {
    if (apiKey == null) {
      promptForAPIKey();
    }
  });
}

if (figma.editorType === 'figma') {
  checkAPIKey(); // Check if the api key is already set if not ask the user for it
} else {
}
