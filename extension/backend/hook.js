/* 

3 things to come back and check: 
  if the export clean is needed - might not need this
  if the string exception is needed when cleaning
  if for the linkedListRecurse you need to check if the next node has the same state as the prev node

*/

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
      const treeArr = [];
      try {
        recurseThrottle(rootNode.child, treeArr);
        console.log('arr before adding atom data: ', treeArr)
        const recoilCurrentState = {}
        throttledGetAtomValues(recoilCurrentState);
        treeArr.push(recoilCurrentState);
        if (treeArr.length > 0) sendToContentScript(treeArr);
      } catch (err) {
        console.log('Error at onCommitFiberRoot:', err)
        sendToContentScript('Uh oh something went wrong with our application, please submit the issue on https://github.com/oslabs-beta/TotalRecoilJS')
      }
      return original(...args);
    }
    return newFunc;
  })(devTools.onCommitFiberRoot) // devTools.onCommitFiberRoot runs immediately after adding our new functionality to devTools.onCommitFiberRoot
  
}

const recurseThrottle = throttle(getComponentData, 300);
const throttledGetAtomValues = throttle(getAtomValues, 300);

function getComponentData(node, arr) {
  const component = {};
  if(getName(node, component, arr) === -1) return;
  getState(node, component)
  getAtom(component)
  arr.push(component)
  //getchildren calls getComponentData (name, state, atom), pushes into nested "children" array
  getChildren(node, component, arr)
}

function getName(node, component, arr) {
  if (!node.type || !node.type.name) {
    // if this is an HTML tag just keep recursing without saving the name
    if (node.child) getComponentData(node.child, arr);
    if (node.sibling) getComponentData(node.sibling, arr);
    return -1;
  } else {
    component.name = node.type.name;
  }
}

function getState(node, component) {
  //checking for 3 conditions (if state exists, if its a linkedlist with state, if its not a linkedlist with state)
  //check if state exists in the node, if not just return and exit out of the function
  if(!node.memoizedState) return;
  // check if the state is stored as a linkedlist
  if(node.memoizedState.memoizedState !== undefined) {
    //check if you're at the end of the linked list chain (.next = null)
    if (node.memoizedState.next === null) {
      component.state = cleanState(node.memoizedState.memoizedState)
      return;
    }
    // initialize array because state is a linkedlist so you can store multiple states in the array
    component.state = [];
    linkedListRecurse(node.memoizedState, component.state);
    return;
  }
  // if the state is not stored as a linkedlist, then run the clean state function
  component.state = cleanState(node.memoizedState)

  function linkedListRecurse(node, treeArr) {
    treeArr.push(cleanState(node.memoizedState))
    //try the below without !== statement - what's the difference?
    if (node.next && node.memoizedState !== node.next.memoizedState) {
      linkedListRecurse(node.next, treeArr) 
    }
  }
}

function getAtom(component) {
  // if component has no state there is not atom for it so just exit from the function;
  if (!component.state) {
    return;
  }
  // Make a new Set
  const atomArr = new Set();
  
  // this will loop through component.state to get the atom data
  for(let i = 0; i < component.state.length; i++) {
    if (component.state[i]['current'] instanceof Set) {
      // this code will give us the value from the set to add to our newly created set
      const it = component.state[i]['current'].values();
      let first = it.next();
      atomArr.add(first.value);
    }
    component.atoms = Array.from(atomArr);
  }
}

function getChildren(node, component, arr) {
  const children = [];
  //check if the node has a child, if so then run the getComponentData on that child node(s)
  if (node.child) {
    getComponentData(node.child, children);
  }
  // check if the node has a sibling, if so then run the getComponentData on that sibling node(s)
  if (node.sibling) getComponentData(node.sibling, arr);
  //if no more child or sibling nodes then return the children array
  if (children.length > 0) component.children = children;
}



function getAtomValues(recoilCurrentState) {
  // recoildebugstate has the atom data stored
  let atomData = window.$recoilDebugStates[window.$recoilDebugStates.length - 1];
  const tempObj = {};
  atomData['atomValues'].forEach((value, key) => {
    // console.log('Key:', key, 'value:', value.contents);
    tempObj[key] = value.contents;
  })

  recoilCurrentState.atomVal = tempObj;
}

function cleanState(stateNode, depth = 0) {
  let result;
  if (depth > 10) return "Max recursion depth reached!"
  //checking if the stateNode is not an object or function, if it is not either return the stateNode
  if (typeof stateNode !== 'object' && typeof stateNode !== 'function') return stateNode;
  
  if (stateNode === null) {
    return null;
  }

  if (typeof stateNode === 'object') {
    //when using useRecoilValue atoms are saved as set - checking for atom data
    if (stateNode instanceof Set) {
      return stateNode;
    }
    if (stateNode.$$typeof && typeof stateNode.$$typeof === 'symbol') {
      //Realize includes edge case check for itemType!==string - when would this happen?
      return `<${stateNode.type.name} />`;
    }
    if (Array.isArray(stateNode)) {
      result = [];
      stateNode.forEach((el, index) => {
        result[index] = cleanState(el, depth + 1)
      })
    } else {
      result = {};
      Object.keys(stateNode).forEach((key) => {
        result[key] = cleanState(stateNode[key], depth + 1)
      });
    }
    return result;
  }

  if (typeof stateNode === 'function') {
    return `function: ${stateNode.name}()`;
  }
}

function sendToContentScript(tree) {
  window.postMessage({ tree }, '*');
}

patcher();

// why is cleanState being exported is it being used anywhere?
// export { cleanState };