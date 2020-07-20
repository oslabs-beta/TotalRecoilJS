/* eslint-disable */

const time = 500;

//check if setTimeout is needed (change the time, etc.)
setTimeout (() => {
  const script = document.createElement('script');
  script.src = chrome.extension.getURL('hook.js');
  document.head.appendChild(script);
}, time);

window.addEventListener('message', handleMessage);

//check whether we need req.data AND data.tree? seems redundant
function handleMessage(request, sender, sendResponse) {
  if (request.data && request.data.tree) {
    sendMessage(request.data.tree);
  }
}

function sendMessage(tree) {
  chrome.runtime.sendMessage(tree);
}