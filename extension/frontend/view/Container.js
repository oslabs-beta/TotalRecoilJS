import React, { useEffect, useState } from 'react';
import Navbar from './Components/Navbar'
import GraphPanel from './Components/GraphPanel'

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
      <Navbar tree={tree} />
    </div>
  )
}

export default Container