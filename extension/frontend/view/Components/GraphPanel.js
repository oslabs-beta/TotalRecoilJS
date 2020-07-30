import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

import SelectorTree from '../SelectorTree'
import TreeView from '../TreeView';


const GraphPanel = (props) => (

  <Router>
    <div className='graphDisplays'>
      <div id='graph-options'>
        <Link to="/"><div className='componentTreeBtn'>Component Tree</div></Link>
        <Link to="/stateTree"><div className='stateTreeBtn'>Selectors and Atoms</div></Link>
      </div>
      <Switch>
        <Route path="/stateTree">
          <SelectorTree tree={props.tree} />
        </Route>
        <Route path="/">
          <TreeView tree={props.tree} />
        </Route>
      </Switch>
    </div>
  </Router>
);

export default GraphPanel;