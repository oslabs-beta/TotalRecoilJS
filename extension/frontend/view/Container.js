<<<<<<< HEAD
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

=======
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

>>>>>>> 67062cb685a93df8594e9b126b5aa9dc878e8f34
export default Container