import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect
} from "react-router-dom";

import SelectorTree from './SelectorTree'
import TreeView from './treeView';


const GraphPanel = (props) => {
  const [view, setView] = useState(true);
  const [viewName, setviewName] = useState('Component Tree')

  const changeView = () => {
    setView(!view);

    if (viewName === 'Component Tree') {
      setviewName('Selector Tree')
    } else {
      setviewName('Component Tree')
    }
  }

  return (
    <div className='graph-container'>
      <h1 className='h1-absolute' >{viewName}</h1>
      <button onClick={changeView} className='graph-button-1'>Change View</button>
      {view ? <TreeView tree={props.tree} /> : <SelectorTree tree={props.tree} />}
    </div>
  )
};

export default GraphPanel;