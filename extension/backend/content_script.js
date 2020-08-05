//this will inject the hook file in the application after 500 milliseconds after the application starts to make sure the hook script is appended when the DOM is loaded
const time = 500;
setTimeout (() => {
  const script = document.createElement('script');
  script.src = chrome.extension.getURL('hook.js');
  document.head.appendChild(script);
}, time);

//this is listening for the message from the hook file
window.addEventListener('message', handleMessage);

//handle message function runs when a message is received from the hook file and if it has the tree data it will fire the sendMessage function
function handleMessage(request, sender, sendResponse) {
  if (request.data && request.data.tree) {
    sendMessage(request.data.tree);
  }
}

//the sendMessage function sends the backend tree and atom/selector data to the background script
function sendMessage(tree) {
  chrome.runtime.sendMessage(tree);
}