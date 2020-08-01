import React, { useEffect, useState } from 'react';
// const prettyPrintJson = require('pretty-print-json');
import JSONPretty from 'react-json-pretty';

const History = ({ history }) => {
  const historyMap = history.map((hist) => {
    console.log('history!',history)
    // get the atoms and state data 
    let snap;
    if (hist.tree[1].atomVal) {
      snap = hist.tree[1].atomVal;
    }

    const data = <JSONPretty style={{fontSize: "3px"}} data={snap}></JSONPretty>
    // creat p tag
    // let json = document.querySelector('#json')
    // json.innerHTML = prettyPrintJson.toHtml(snap)
    return <summary>History{hist.count}: {data}</summary>
  });

  // display new history every time tree updates
  return (
    <div id="history-tab">
      <div id="history-info">
        <h3>History</h3>
        <p id='json'></p>
        {console.log(historyMap,'history')}
        {historyMap}
      </div>
    </div>
  )
}

export default History;