import React, { useEffect, useState } from 'react';
const prettyPrintJson = require('pretty-print-json');

const History = ({ tree }) => {
  // display new history every time tree updates
  const [count, setCount] = useState(0);
  useEffect(() => {
    let lastHistory;
    let stringTree = tree ? JSON.stringify(tree[1].atomVal) : null;
    if (history.length) {
      lastHistory = JSON.stringify(history[history.length - 1].tree[1].atomVal);
    }
    if (lastHistory == stringTree) return;
    if (history.length === 5) {
      const historyCopy = [...history]
      historyCopy.shift();
      setHistory([...historyCopy, { count, tree }]);
    } else {
      setHistory([...history, { count, tree }]);
    }
    setCount(count + 1);
  }, [tree])

  const historyMap = history.map((hist) => {
    // get the atoms and state data 
    let snap;
    if (hist.tree[1].atomVal) {
      snap = hist.tree[1].atomVal;
    }

    // let data = JSON.stringify(snap)
    // creat p tag
    // let json = document.querySelector('#json')
    // json.innerHTML = prettyPrintJson.toHtml(snap)

    // return <div>{prettyPrintJson.toHtml(snap)}</div>
  }).reverse();

  // display new history every time tree updates
  return (
    <div id="history-tab">
      <div id="history-info">
        <h3>History</h3>
        <p id='json'></p>
        {historyMap}
      </div>
    </div>
  )
}

export default History;