import React, { useEffect, useState } from 'react';



const History = ({ tree }) => {
  // display new history every time tree updates
  const [history, setHistory] = useState([]);
  const [count, setCount] = useState(0);
  // TEST: max history length 3
  // setHistory([...history, tree])
  useEffect(() => {
    let lastHistory;
    let stringTree = JSON.stringify(tree[1].atomVal);
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
    return <p>{hist.count}: {JSON.stringify(snap)}</p>
  })

  // display new history every time tree updates
  return (
    <div id="history-tab">
      <div id="history-info">
        <p>History</p>
        {/* {history.map((hist) => {
          return <p>{hist.count}:</p>
        })} */}
        {historyMap}
      </div>
    </div>
  )
}

export default History;