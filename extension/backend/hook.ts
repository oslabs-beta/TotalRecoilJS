const throttle = require('lodash.throttle')

//the export exists to indicate that the file is a module for typescript to allow the code to use global object
export {};
//define variable types for typscript here
declare global {

  interface devTools {
    renderers: { size?: number };
    // onCommitFiberRoot(any?);
  }

  interface Window {
    __REACT_DEVTOOLS_GLOBAL_HOOK__: devTools;
  }

  interface Component {
    name: any;
    state?: any;
    children?: any;
    atoms?: any;
  }


}

function patcher() {

  // grabs the React DevTools from the browser
  const devTools:any = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
  // if conditions to check if devTools is running or the user application is react
  if (!devTools) {
    sendToContentScript('React DevTools is not activated, please activate React DevTools!')
  }
  if (devTools.renderers && devTools.renderers.size < 1) {
    sendToContentScript('The page is not using React or if it is using React please trigger a state change!')
  }
  // adding/patching functionality to capture fiberTree data to the onCommitFiberRoot method in devTools
  devTools.onCommitFiberRoot = (function (original) {
    function newFunc(...args:any) {
      const fiberDOM = args[1];
      const rootNode = fiberDOM.current.stateNode.current;
      //create a new array that will be sent to the frontend after being populated with necessary data
      const treeArr: any[] = [];
      try {
        //this function collects the data for the component tree and stores atom names and state data
        recurseThrottle(rootNode.child, treeArr);
        //this function below gets the atom value data for the right panel in UI
        treeArr.push(getAtomValues(treeArr[0], 'atomValues'));
        //this function gets the link between selectors and atom for the selector/atom tree
        treeArr.push(getSelectorAtomLink(treeArr[0], 'nodeToNodeSubscriptions'))
        //if the data is populated correctly, the array will be sent to the content_script file in the backend
        console.log('treearr sent to frontend', treeArr)
        if (treeArr.length > 0) sendToContentScript(treeArr);
      } catch (err) {
        console.log('Error at onCommitFiberRoot:', err)
        sendToContentScript('Error: something went wrong with our application, please submit the issue on https://github.com/oslabs-beta/TotalRecoilJS')
      }
      return original(...args);
    }
    return newFunc;
    // Below syntax devTools.onCommitFiberRoot runs immediately after adding our new functionality to devTools.onCommitFiberRoot (and the input is the original function of onCommitFiberRoot)
  })(devTools.onCommitFiberRoot)

}

//throttling the recusrive function getComponentData to run only once in 300 milliseconds, to improve performance as changes are made in the user application 
const recurseThrottle = throttle(getComponentData, 300);

//recursive function (getComponentData) below traverses through the fiber tree and collects certain component,state, and atom data
function getComponentData(node: any, arr: any[]) {
  const component: Component = {name: ''};
  if (getName(node, component, arr) === -1) return;
  getState(node, component)
  getAtom(component)
  arr.push(component)
  //getchildren calls getComponentData (name, state, atom), pushes into nested "children" array
  getChildren(node, component, arr)
}

//this function will get the same of the React components
function getName(node: any, component: any, arr: Array<any>) {
  if (!node.type || !node.type.name) {
    // if this is an HTML tag just keep recursing without saving the name
    if (node.child) getComponentData(node.child, arr);
    if (node.sibling) getComponentData(node.sibling, arr);
    return -1;
  } else {
    component.name = node.type.name;
  }
}

//this functions gets all the data related to state in React fiber (and the data stored here is used later in other functions)
function getState(node: any, component: any) {
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
  function linkedListRecurse(node: any, treeArr: any[]) {
    treeArr.push(cleanState(node.memoizedState))
    if (node.next && node.memoizedState !== node.next.memoizedState) {
      linkedListRecurse(node.next, treeArr)
    }
  }
}

//this function traverses through component.state property collected in the function getState and stores atom names
function getAtom(component: Component) {
  // if component has no state there is not atom for it so just exit from the function;
  if (!component.state) {
    return;
  }
  // Make a new empty Set
  const atomArr = new Set();

  // this will loop through component.state to get the atom data
  for (let i = 0; i < component.state.length; i++) {
      if (component.state[i]['current'] instanceof Set || component.state[i]['current'] instanceof Map) {
        
        // this code will give us the value from the existing set/map in component.state to add to our newly created set
        const it = component.state[i]['current'].values();
        let first = it.next();
        atomArr.add(first.value);

      }

      //below code will convert the data in the create set to an array in component.atoms property, take out any duplicates, and delete the propert if no atoms exists for the component
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

//this is will get all the children and sibling components linked to the current component node and then run the recursive function getComponentData again on each child/sibling node
function getChildren(node: any, component: Component, arr: any[]) {
  const children: any[] = [];
  //check if the node has a child, if so then run the getComponentData on that child node(s)
  if (node.child) {
    getComponentData(node.child, children);
  }
  // check if the node has a sibling, if so then run the getComponentData on that sibling node(s)
  if (node.sibling) getComponentData(node.sibling, arr);
  //if no more child or sibling nodes then return the children array
  if (children.length > 0) component.children = children;
}

//this function populates atom values in the second position of the array that is sent to the front end
function getAtomValues(obj: object, prop: string) {
  const arr: any = [];
  
  //this function populates the array with the data as map object that is found in tree
  function recursivelyFindProp(o: any, keyToBeFound: string) {
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

  //it recurses throught nested objects and arary to find the key 'atomValues' where the atom value data is stored (the atom values are in a map object)
  recursivelyFindProp(obj, prop);

  //the skeleton structure of how the data object will look stored in the array to send to the frontend
  interface Result {
    atomVal: any
  }

  const result: Result = {
    atomVal: {}
  }
  
  //converting map objects where the atom value is found into the result object with a key value pair
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

//this function creates and stores the data for the selector/atom tree and stores in the 3rd position in the array sent to the frontend
function getSelectorAtomLink(obj: any, prop: string) {
  let arr: any[] = [];
  function recursivelyFindProp(o: any, keyToBeFound: string) {
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

  //this function recursively finds the key 'nodeToNodeSubscriptions' which has the data for atom to selector connections
  recursivelyFindProp(obj, prop);

  //skeleton structure of how the data will be stored in the array
  interface SelectorTree {
    name: string;
    children: any[];
  }

  const result: SelectorTree = {
    name: 'Selector Tree',
    children: []
  }

  interface NonSelectorAtoms {
    name: string;
    children: any[];
  }

  const tempObj: NonSelectorAtoms = {name: 'nonSelectorAtoms', children: []}
  result.children.push(tempObj)

  //converting map data into object data to be stored
  const newArr = arr.filter((item, index) => arr.indexOf(item) === index)
  for (let i = 0; i < newArr.length; i++) {
    let mapData = newArr[i]
    if (mapData) {
      for (let [key, value] of mapData) {
        let tempArr = [...value]
        for (let el of tempArr) {

          let tempObj: SelectorTree = {
            name: '',
            children: []
          }
          tempObj.name = el;

          interface TreeValObj {
            name: string;
            value: number;
          }
          
          const treeValObj = {
            name: key,
            value: 100
          }

          tempObj.children.push(treeValObj);
          result.children.push(tempObj);
        }
      }
    }
  }

  let atomsAndSelectors: any = [];
  //finds all the atoms with selector connetions and compares if there are any atom names that exist in the component tree that do not show up in the 'nodeToComponentSubscriptions' because those are the atoms with no selectors
  function getNonSelectorAtoms(result: any, obj: any) {
    //below function finds the atom/selector data found in 'nodeToComponentSubscriptions' key
    findNested(obj, 'nodeToComponentSubscriptions')
    if(atomsAndSelectors.length > 0) {
      let atomsAndSelectorsArr = Array.from(atomsAndSelectors[0].keys());
      for (const el of atomsAndSelectorsArr) {

        if (!doesNestedValueExist(result, el)) {
          result.children[0].children.push({name: el, value: 100});
        } 

      }
    }
  }

  //checks if a value exits in a nested object
  function doesNestedValueExist(obj: any, text: any): boolean {
    let exists = false;
    let keys = Object.keys(obj);
    for(let i = 0; i < keys.length; i++) {
      let key = keys[i];
      let type = typeof obj[key];
      if(type === 'object') {
        exists = doesNestedValueExist(obj[key], text);
      } 
      // else if(type === 'array') {
      //   for(let j = 0; j < obj[key].length; j++) {
      //     exists = doesNestedValueExist(obj[key][j], text);
      
      //     if(exists) {
      //       break;
      //     }
      //   }
      // } 
      else if(type === 'string') {
        exists = obj[key].indexOf(text) > -1;
      }
      if(exists) {
        break;
      }
    }
    return exists;
  };

  //returns the data that exists for the key value that is in keyToBeFound input in a nested object
  function findNested(o: any, keyToBeFound: string) {
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
  //this function recursively finds atoms that have no selectors
  getNonSelectorAtoms(result, obj)
  return result;
}

//this function cleans the state data for component.state property (this function is run inside getState function)
function cleanState(stateNode: any, depth = 0) {
  let result: any;
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

//the function that sends the array with the necessary tree data to the frontend
function sendToContentScript(obj: any) {
  const tree = JSON.parse(JSON.stringify(obj));
  window.postMessage({ tree }, '*');
}

//the patcher function is invoked one time when the app first runs to modify the onCommitFiberRoot function in React devTools
patcher();