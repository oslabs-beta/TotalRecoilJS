import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect
} from "react-router-dom";

import SelectorTree from '../SelectorTree'
import TreeView from '../TreeView';


const GraphPanel = (props) => {
  const [view, setView] = useState(true);
  const [viewName, setviewName] = useState('Component Tree')

  const changeView = () => {
    setView(!view);
    // change text of the button
    // buttonName === 'Component Tree' ? 
    if (viewName === 'Component Tree') {
      setviewName('Selector Tree')
    } else {
      setviewName('Component Tree')
    }

    // console.log(view);
  }

  return (
    <div className='graph-container'>
      <h1 className='h1-absolute' >{viewName}</h1>
      <button onClick={changeView} className='graph-button-1'>Change View</button>
      {view ? <TreeView tree={props.tree} /> : <SelectorTree tree={props.tree} />}
    </div>

    // <Router>
    //   <div className='graphDisplays'>
    //     <div id='graph-options'>
    //       <Link to="/"><button onClick={changeView} className='graph-button-1'>Component Tree</button></Link>
    //       <Link to="/stateTree"><button className='graph-button-2'>Selectors and Atoms</button></Link>
    //     </div>
    //     <Switch>
    //       <Route
    //         exact
    //         path="/"
    //         render={() => {
    //           console.log(view)
    //           return (
    //             view ? <Redirect to="/" /> : <Redirect to="/stateTree" />
    //           )
    //         }
    //         }
    //       >
    //       </Route>

    //       <Route path="/stateTree"><SelectorTree tree={props.tree} /></Route>
    //       <Route path="/"><TreeView tree={props.tree} /></Route>
    //     </Switch>
    //   </div>
    // </Router>
  )
};

export default GraphPanel;