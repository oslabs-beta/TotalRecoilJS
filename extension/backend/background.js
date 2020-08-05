const connectedTabs = {};

//opens a long-running port connection between background script and content script
//adds tab info for any tab that has our extension open
//executes content script on connect (aka adding hook.js script)cd ..
chrome.runtime.onConnect.addListener((port) => {

  const panelListener = (request, sender, sendResponse) => {
    if (request.name === 'connect' && request.tabID) {
      connectedTabs[request.tabID] = port;
    }
    chrome.tabs.executeScript({
      file: './content_script.js'
    });
  }

  //keeps listening on open port
  port.onMessage.addListener(panelListener);

  //when the port is disconnected it removes the tabID from the connectedTabs object and removes panelListener
  port.onDisconnect.addListener(function(port) {

    port.onMessage.removeListener(panelListener);
    const tabs = Object.keys(connectedTabs);
    for (let k = 0; k < tabs.length; k++) {
      if (connectedTabs[tabs[k]] === port){
        delete connectedTabs[tabs[k]];
        break;
      } 
    }
    
  });
  
});

//runs after receiving message from the content script, it keeps track of the tab.id data when the recoil function in currently running on for reference
function handleMessage(request, sender, sendResponse) {
  if(sender.tab) {
    const tabID = sender.tab.id;
    if (tabID in connectedTabs) {
      connectedTabs[tabID].postMessage(request);
    }
  }
  
  return Promise.resolve('Filler resolution for the browser');
}

//listens for messages from content script
chrome.runtime.onMessage.addListener(handleMessage);


//on every refresh this listener injects the content script
chrome.tabs.onUpdated.addListener(function(tabID, changeInfo, tab) {
  if(connectedTabs[tabID]) {
    chrome.tabs.executeScript({
      file: './content_script.js'
    });
  }
})