/* eslint-disable */
const throttle = require('lodash.throttle')


function patcher() {
  
  // grabs the React DevTools from the browser
  const devTools = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;

  // if conditions to check if devTools is running or the user application is react
  if(!devTools) {
    sendToContentScript('devTools is not activated, please activate!')
  }
  if(devTools.renderers && devTools.renderers.size < 1) {
    sendToContentScript('The page is not using React or if it is using React please trigger a state change!')
  }

  // adding/patching functionality to capture fiberTree data to the onCommitFiberRoot method in devTools
  devTools.onCommitFiberRoot = (function (original) {
    function newFunc(...args){
      const fiberDOM = args[1];
      const rootNode = fiberDOM.current.stateNode.current;
      const arr = [];
      try {
        recurseThrottle(rootNode.child, arr);
        const recoilCurrentState = {}
        getAtomValues(recoilCurrentState);
        arr.push(recoilCurrentState);
        if (arr.length > 0) sendToContentScript(arr);
      } catch (err) {
        console.log('Error at onCommitFiberRoot:', err)
        sendToContentScript('Uh oh something went wrong with our application, please submit the issue on https://github.com/oslabs-beta/TotalRecoilJS')
      }
      return original(...args);
    }
    return newFunc;
  })(devTools.onCommitFiberRoot) // devTools.onCommitFiberRoot runs immediately after adding our new functionality to devTools.onCommitFiberRoot

const recurseThrottle = throttle(getComponentData, 300);
  
}

function getComponentData(node, arr) {
  const component = {};
  getName(node, component, arr)
  getState(node, component)
  getAtom(component)
  arr.push(component)
  //getchildren calls getComponentData (name, state, atom), pushes into nested "children" array
  getChildren(node, component, arr)
}

function getName(node, component) {
  
}

function getState(node, component) {

}

function getAtom(component) {
  
}

function getChildren(component) {

}

function getAtomValues(recoilCurrentState) {

}

function sendToContentScript() {
  
}

patcher();

