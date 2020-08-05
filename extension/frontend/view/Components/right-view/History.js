import React, { useEffect, useState, useRef } from 'react';
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
  useEffect(scrollToBottom, [history]);


  const historyMap = history.map((hist) => {
    console.log('history!', history)
    // get the atoms and state data 
    let snap;
    if (hist.tree[1].atomVal) {
      snap = hist.tree[1].atomVal;
    }

    const data = <JSONPretty data={snap}></JSONPretty>
    // creat p tag
    // let json = document.querySelector('#json')
    // json.innerHTML = prettyPrintJson.toHtml(snap)
    return <summary><p className="blue">History {hist.count}: </p>{data}</summary>
  });


  // display new history every time tree updates
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