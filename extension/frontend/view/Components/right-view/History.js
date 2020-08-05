import React, { useEffect, useRef } from 'react';
import JSONPretty from 'react-json-pretty';

const History = ({ history }) => {
  // scroll to bottom of history
  const messagesEnd = useRef(null);
  const scrollToBottom = () => {
    messagesEnd.current.scrollIntoView({ block: 'end', behavior: 'smooth', inline: 'nearest' })
  }
  // useEffect(() => {
  //   messagesEnd.current.scrollTop = messagesEnd.current.scrollHeight;
  // });
  useEffect(scrollToBottom, []);

  const historyMap = history.map((hist) => {
    // get the atoms and state data 
    let snap;
    if (hist.tree[1].atomVal) {
      snap = hist.tree[1].atomVal;
    }
    const data = <JSONPretty data={snap}></JSONPretty>
    return <summary><p className="blue">History {hist.count}: </p>{data}</summary>
  });

  return (
    <div id="history-tab">
      <div id="history-info">
        <p id='json'></p>
        {historyMap}
        <div ref={messagesEnd}></div>
      </div>
    </div >
  )
}

export default History;