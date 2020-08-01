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
  if (!devTools) {
    sendToContentScript('devTools is not activated, please activate!')
  }
  if (devTools.renderers && devTools.renderers.size < 1) {
    sendToContentScript('The page is not using React or if it is using React please trigger a state change!')
  }
  // adding/patching functionality to capture fiberTree data to the onCommitFiberRoot method in devTools
  devTools.onCommitFiberRoot = (function (original) {
    function newFunc(...args) {
      const fiberDOM = args[1];
      console.log(fiberDOM);
      const rootNode = fiberDOM.current.stateNode.current;
      // console.log('fibertree rootNode: ', rootNode);
      const treeArr = [];
      try {
        recurseThrottle(rootNode.child, treeArr);
        // console.log('arr before adding atom data: ', treeArr)
        treeArr.push(getAtomValues(treeArr[0], 'atomValues'));
        treeArr.push(getSelectorAtomLink(treeArr[0], 'nodeToNodeSubscriptions'))
        console.log('arr before sending to content script: ', treeArr);
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
function getComponentData(node, arr) {
  const component = {};
  if (getName(node, component, arr) === -1) return;
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
  if (!node.memoizedState) return;
  // check if the state is stored as a linkedlist
  if (node.memoizedState.memoizedState !== undefined) {
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
  for (let i = 0; i < component.state.length; i++) {
      if (component.state[i]['current'] instanceof Set || component.state[i]['current'] instanceof Map) {
        // if (component.state[i]['current'] instanceof Set) {
        // this code will give us the value from the set to add to our newly created set
        const it = component.state[i]['current'].values();
        let first = it.next();
        atomArr.add(first.value);
      }
      component.atoms = Array.from(atomArr);
      if (component.atoms.length === 0) {
        delete component.atoms;
      } else {
        for (const el of component.atoms) {
          if (typeof el !== 'string') {
            let index = component.atoms.indexOf(el);
            component.atoms.splice(index, 1);
          }
        }
      }
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

function getAtomValues(obj, prop) {
  const arr = [];
  //this function populates the array with the data as map object that is found in tree
  function recursivelyFindProp(o, keyToBeFound) {
    if (typeof o !== 'object' || !o) {
      return;
    }
    Object.keys(o).forEach(function (key) {
      if (key === keyToBeFound) {
        arr.push(o[key])
      } else {
        if (typeof o[key] === 'object') {
          recursivelyFindProp(o[key], keyToBeFound);
        }
      }
    });
  }
  recursivelyFindProp(obj, prop);
  const result = {
    'atomVal': {

    }
  }
  
  for (let i = 0; i < arr.length; i++) {
    let mapData = arr[i]
    if (mapData) {
      for (let [key, value] of mapData) {
        result.atomVal[key] = value.contents;
      }
    }
  }
  return result;

}

function getSelectorAtomLink(obj, prop) {
  let arr = [];
  function recursivelyFindProp(o, keyToBeFound) {
    if (typeof o !== 'object' || !o) {
      return;
    }
    Object.keys(o).forEach(function (key) {
      if (key === keyToBeFound) {
        arr.push(o[key])
      } else {
        if (typeof o[key] === 'object') {
          recursivelyFindProp(o[key], keyToBeFound);
        }
      }
    });
  }
  recursivelyFindProp(obj, prop);
  const result = {
    'name': 'Selector Tree',
    'children': []
  }
  result.children.push({ name: 'NonSelectorAtoms', children: []})
  const newArr = arr.filter((item, index) => arr.indexOf(item) === index)
  for (let i = 0; i < newArr.length; i++) {
    let mapData = newArr[i]
    if (mapData) {
      for (let [key, value] of mapData) {
        let tempArr = [...value]
        for (let el of tempArr) {
          let tempObj = {
            name: '',
            children: []
          }
          tempObj.name = el;
          tempObj.children.push({name: key, value: 100});
          result.children.push(tempObj);
        }
      }
    }
  }

  let atomsAndSelectors = []
  function getNonSelectorAtoms(result, obj) {
    findNested(obj, 'nodeToComponentSubscriptions')
    if(atomsAndSelectors.length > 0) {
      let atomsAndSelectorsArr = [...atomsAndSelectors[0].keys()]
      for (const el of atomsAndSelectorsArr) {
        if (!doesNestedValueExist(result, el)) {
          result.children[0].children.push({name: el, value: 100});
        } 
      }
    }
  }

  function doesNestedValueExist(obj, text) {
    var exists = false;
    var keys = Object.keys(obj);
    for(var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var type = typeof obj[key];
      if(type === 'object') {
        exists = doesNestedValueExist(obj[key], text);
      } else if(type === 'array') {
        for(var j = 0; j < obj[key].length; j++) {
          exists = doesNestedValueExist(obj[key][j], text);
      
          if(exists) {
            break;
          }
        }
      } else if(type === 'string') {
        exists = obj[key].indexOf(text) > -1;
      }
      if(exists) {
        break;
      }
    }
    return exists;
  };

  function findNested(o, keyToBeFound) {
    if (typeof o !== 'object' || !o) {
      return;
    }
    Object.keys(o).forEach(function (key) {
      if (key === keyToBeFound) {
        atomsAndSelectors.push(o[key]);
      } else {
        if (typeof o[key] === 'object') {
          findNested(o[key], keyToBeFound);
        }
      }
    });
  }
  getNonSelectorAtoms(result, obj)
  return result;
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
    if (stateNode instanceof Map) {
      return stateNode;
    }
    if (stateNode.$$typeof && typeof stateNode.$$typeof === 'symbol') {
      //Realize includes edge case check for itemType!==string - when would this happen?
      // return `<${stateNode.type.name} />`;
      return stateNode.type && typeof stateNode.type !== 'string' ? `<${stateNode.type.name} />` : 'React component';
    }
    if (Array.isArray(stateNode)) {
      result = [];
      stateNode.forEach((el, index) => {
        if (el !== null) {
          result[index] = cleanState(el, depth + 1)
        } else {
          result[index] = el;
        }
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
function sendToContentScript(obj) {
  const tree = JSON.parse(JSON.stringify(obj));
  window.postMessage({ tree }, '*');
}
patcher();
// why is cleanState being exported is it being used anywhere?
// export { cleanState };