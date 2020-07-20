/* eslint-disable no-param-reassign */
/* eslint-disable no-undef */
/* eslint-disable no-use-before-define */
/* eslint-disable func-names */
/* eslint-disable no-underscore-dangle */

const throttle = require('lodash.throttle');
// need to define types here
declare global {
  interface devTools {
    renderers: { size?: number };
    onCommitFiberRoot(any?);
  }
  interface Window {
    __REACT_DEVTOOLS_GLOBAL_HOOK__: devTools;
    $recoilDebugStates;
  }
  interface currentState {
    atomVal?: any;
  }
  interface component {
    name: any;
    node?: any;
    state?: object;
    stateType?: { stateful: boolean; receiving: boolean; sending: any } | -1;
    hooks?: [string];
    children?: [string] | [];
    props?: object;
    atoms?: any;
  }
}
function hook() {
  const devTools = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
  // console.log('its working i think??')
  // console.log('devTools inside Hook: ', devTools)
  // if devtools not activated
  if (!devTools) {
    sendToContentScript("Looks like you don't have react devtools activated");
    return;
  }
  // if hook can't find react
  if (devTools.renderers && devTools.renderers.size < 1) {
    sendToContentScript("Looks like this page doesn't use React. Go to a React page and trigger a state change");
    return;
  }
  // patch react devtools function called on render
  devTools.onCommitFiberRoot = (function (original) {
    return function (...args) {
      const fiberDOM = args[1];
      // console.log('fiberDOM: ', fiberDOM);
      const rootNode = fiberDOM.current.stateNode.current;
      const arr = [];
      try {
        throttledRecurse(rootNode.child, arr);
        const currentState: currentState = {}
        getAtomValues(currentState);
        arr.push(currentState)
        // console.log('currentState inside oncommitfiber: ', currentState)
        // console.log('arr before sending contentscript: ', arr)
        if (arr.length > 0) sendToContentScript(arr);
      } catch (error) {
        console.log('err at onCommitFiberRoot:', error)
        sendToContentScript(
          "we're sorry, there was an error on our end. To contribute: https://github.com/oslabs-beta/Realize"
        );
      }
      return original(...args);
    };
  })(devTools.onCommitFiberRoot);
}
// message sending function
function sendToContentScript(tree) {
  // for debugging:
  // console.log(tree);
  window.postMessage({ tree }, '*');
}
const clean = (item, depth = 0): any => {
  // base case
  // console.log('item inside clean: ', item)
  if (depth > 10) return 'max recursion depth reached';
  if (typeof item !== 'object' && typeof item !== 'function') return item;
  // if item is composite
  if (item === null) return null;
  if (typeof item === 'object') {
    let result;
    if (item instanceof Set) {
      // console.log('Item is a Set: ', item)
      return item;
    }
    // if (item instanceof Map) {
    //   console.log('Item is a Map: ', item)
    //   return item;
    // }
    if (item.$$typeof && typeof item.$$typeof === 'symbol') {
      return item.type && typeof item.type !== 'string'
        ? `<${item.type.name} />`
        : 'React component';
    }
    if (Array.isArray(item)) {
      result = [];
      item.forEach((elem, idx) => {
        result[idx] = clean(elem, depth + 1);
      });
    } else {
      result = {};
      Object.keys(item).forEach((key) => {
        result[key] = clean(item[key], depth + 1);
      });
    }
    // console.log('result inside clean: ', result)
    return result;
  }
  if (typeof item === 'function') {
    return `function: ${item.name}()`;
  }
};
const getName = (node, component, parentArr): void | -1 => {
  if (!node.type || !node.type.name) {
    // this is a misc fiber node or html element, continue without appending
    if (node.child) recurse(node.child, parentArr);
    if (node.sibling) recurse(node.sibling, parentArr);
    return -1;
  } else {
    // if valid, extract component name
    component.name = node.type.name;
  }
};
const getState = (node, component): void => {
  // for linked list recursion
  // console.log('node.memoizedState :', node.memoizedState)
  const llRecurse = (stateNode, arr): any => {
    arr.push(clean(stateNode.memoizedState));
    // arr.push(stateNode.memoizedState);
    if (
      stateNode.next &&
      stateNode.memoizedState !== stateNode.next.memoizedState
    )
      llRecurse(stateNode.next, arr);
  };
  // if no state, exit
  if (!node.memoizedState) return;
  // if state stored in linked list
  if (node.memoizedState.memoizedState !== undefined) {
    if (node.memoizedState.next === null) {
      component.state = clean(node.memoizedState.memoizedState);
      // component.state = node.memoizedState.memoizedState;
      return;
    }
    component.state = [];
    llRecurse(node.memoizedState, component.state);
    return;
  }
  // not linked list
  component.state = clean(node.memoizedState);
  // component.state = (node.memoizedState);
};
const getProps = (node, component): void => {
  if (node.memoizedProps && Object.keys(node.memoizedProps).length > 0) {
    const props = {};
    Object.keys(node.memoizedProps).forEach((prop) => {
      props[prop] = clean(node.memoizedProps[prop]);
    });
    component.props = props;
  }
};
const getHooks = (node, component): void => {
  if (node._debugHookTypes) component.hooks = node._debugHookTypes;
};
const getChildren = (node, component, parentArr): void => {
  const children = [];
  if (node.child) {
    recurse(node.child, children);
  }
  if (node.sibling) recurse(node.sibling, parentArr);
  //   console.log(children.length);
  if (children.length > 0) component.children = children;
};
const getStateType = (component): void => {
  // console.log('component inside getStateType: ', component)
  const stateType = {
    stateful: !(component.state === undefined),
    receiving: !(component.props === undefined),
    sending:
      component.children &&
      component.children.some((child) => child.props !== undefined),
  };
  if (Object.values(stateType).some((isTrue) => isTrue)) {
    component.stateType = stateType;
  }
};
const getAtom = (component): void => {
  // save in an array
  // const atomArr = [];
  if (!component.state) {
    return;
  }
  // Make a new Set
  const atomArr = new Set();
  // Set.Add()
  // components.atoms = [... Set.values()]
  for(let i = 0; i < component.state.length; i++) {
    // console.log('component.state inside getAtom: ', component.state[i])
    if (component.state[i]['current'] instanceof Set) {
      // console.log('hitting instance of')
      // console.log('component.state[current]', component.state[i]['current'])
      // if(atomArr.indexOf([...component.state.current.values()][0]) === -1) {
      //   atomArr.push([...component.state.current.values()][0])
      // }
      const it = component.state[i]['current'].values();
      let first = it.next();
      atomArr.add(first.value);
      // values.forEach(el => atomArr.add(values))
    }
    // if (Array.isArray(component.state[i]) && component.state[i][0] === 'function: ()') {
    //   if (Array.isArray(component.state[i][1]) && component.state[i][1][0]['key']) {
    //     // atomArr.push(component.state[i][1][0]);
    //     atomArr.add(component.state[i][1][0]);
    //     // component.atoms = component.state[i][1][0];
    //   }
    // }
  }
  // components.atom = savedArray
  component.atoms = Array.from(atomArr);
};
//const throttledAtomValues = throttle(getAtomValues, 300);
const getAtomValues = (currentState): void => {
  let atomData = window.$recoilDebugStates[window.$recoilDebugStates.length - 1];
  //atomData is an object (latest atom data)
  //we need go into key 'atomValues'
  //atomValues is map with data with index (number of atoms) [each index is one atom]
  //inside the index there are 2 keys, key and value (key is the atom name) and value is an object
  //inside value object we want to look in the key 'contents' (contents value type is whatever was created in the atom) [THIS IS THE DATA WE NEED]
  const tempObj = {};
  atomData['atomValues'].forEach((value, key) => {
    // console.log('Key:', key, 'value:', value.contents);
    tempObj[key] = value.contents;
  })
  currentState.atomVal = tempObj;
  // const atoms = {
  //   "atom1": {
  //     "state": [{"count": "1"}],
  //     "components": ["Son of A","Daughter of B"]
  //   },
  //   "atom2": {
  //     "length": "1",
  //     "components": ["Level 2: B"]
  //   }
  // }
};
const throttledRecurse = throttle(recurse, 300);
// function for fiber tree traversal
function recurse(node: any, parentArr) {
  const component: component = {
    name: '',
    // for debugging:
    // node,
  };
  // const currentState: currentState = {}
  // console.log('node inside recurse', node)
  // if invalid component, recursion will contine, exit here
  if (getName(node, component, parentArr) === -1) return;
  getState(node, component);
  getProps(node, component);
  getHooks(node, component);
  getAtom(component);
  // insert component into parent's children array
  parentArr.push(component);
  // below functions must execute after inner recursion
  getChildren(node, component, parentArr);
  getStateType(component);

  // getAtomValues(currentState);
  // console.log('currentState after populating data: ', currentState)
  // parentArr.push(currentState);
}
hook();
export { clean };