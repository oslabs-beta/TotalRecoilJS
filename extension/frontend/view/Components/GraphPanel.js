import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import About from './About'
import Users from './Users'
import Atoms from '../atomView'
import SelectorTree from '../selectorAtomView'
import Tree from '../treeView';


const GraphPanel = (props) => (
  
  <Router>
    <div className='graphDisplays'>
      <div id='graph-options'>
        <Link to="/componentTree"><div className='componentTreeBtn'>Component Tree</div></Link>
        <Link to="/stateTree"><div className='stateTreeBtn'>Selectors and Atoms</div></Link>
      </div>
      <Switch>
        <Route path="/componentTree">
          <Tree tree={props.tree} />
        </Route>
        <Route path="/stateTree">
          <SelectorTree />
        </Route>
      </Switch>
    </div>
  </Router>
);

export default GraphPanel;