<<<<<<< HEAD
/* eslint-disable no-use-before-define */
/* eslint-disable no-undef */

const time = 500;

setTimeout(() => {
  console.log('what is happening here')
  const script = document.createElement('script');
  script.src = chrome.extension.getURL('hook.js');
  document.head.appendChild(script);
}, time);

const sendMessage = (tree) => {
  console.log('sending message from content_script.js')
  chrome.runtime.sendMessage(tree);
};

// sends data from content_script to panel.js port.onMessage.addListener
function handleMessage(request, sender, sendResponse) {
  if (request.data && request.data.tree) {
    console.log('handle message',request.data.tree)
    sendMessage(request.data.tree);
  }
}

window.addEventListener('message',handleMessage);
=======
/* eslint-disable */
>>>>>>> e4ad8255f2151ceaa9fd94b6dcbb5f8f8311491c
