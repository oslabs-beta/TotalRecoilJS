import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import Tree from './treeView';
import Atoms from './atomView';
import Navbar from './Components/Navbar'

const App = () => {
  return (
    <div>
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

  return (
    <div id='main-container'>
      <Tree tree={tree} />
      <Navbar tree={tree} />
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))

