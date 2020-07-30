import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import Tree from './treeView';
import Atoms from './atomView';
import Navbar from './Components/Navbar'
import GraphPanel from './Components/GraphPanel'

const App = () => {
  return (
    <div id="container-wrapper">
      <Container />
    </div>
  )
}

const port = chrome.runtime.connect({ name: 'test' })

const Container = () => {

  const [tree, setTree] = useState();

  useEffect(() => {
    port.postMessage({
      name: 'connect',
      tabID: chrome.devtools.inspectedWindow.tabId,
    })

    port.onMessage.addListener((message) => {
      if (message.length === 3) {
        setTree(message)
      }

    })
   
  
  }, [])

  // change tree component to the GraphPanel component
  // pass props: tree and selector tree
  return (
    <div id='main-container'>
      <GraphPanel tree={tree} />
      {/* <Tree tree={tree} /> */}
      <Navbar tree={tree} />
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))

