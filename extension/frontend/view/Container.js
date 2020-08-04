import React, { useEffect, useState } from 'react';
import Navbar from './Components/right-view/Navbar'
import GraphPanel from './Components/left-view/GraphPanel'
import * as d3 from '../../libraries/d3'
const port = chrome.runtime.connect({ name: 'test' })


const Container = () => {
  const [tree, setTree] = useState();
  const [history, setHistory] = useState([]);
  const [count, setCount] = useState(1);
  // const [atomhover, setatomhover] = useState([])
  

  // function is receiving fibernode state changes from backend and is saving that data to tree hook
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
 

  // parsing information for history tab
  useEffect(() => {
    let lastHistory;
    let stringTree = tree ? JSON.stringify(tree[1].atomVal) : null;
    if (history.length) {
      lastHistory = JSON.stringify(history[history.length - 1].tree[1].atomVal);
    }
    if (lastHistory == stringTree) return;
    if (history.length === 7) {
      const historyCopy = [...history]
      historyCopy.shift();
      setHistory([...historyCopy, { count, tree }]);
    } else {
      setHistory([...history, { count, tree }]);
    }
    setCount(count + 1);
  }, [tree])

    // const svg = d3.select('#canvas')
    // const node = svg.selectAll('.node')
    
   

  return (
    <div id='main-container'>
      <GraphPanel tree={tree} />
      <Navbar tree={tree} history={history} />
    </div>
  )
}

export default Container