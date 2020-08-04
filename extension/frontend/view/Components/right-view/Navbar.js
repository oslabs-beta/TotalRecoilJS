import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  NavLink
} from "react-router-dom";
import History from './History'
import AtomView from './atomView'

const Navbar = (props) => (
  <Router>
    <header className='navbar'>
      <div id='link-container'>
        <NavLink activeClassName='a-right-active' className='a-right' to="/h">Atom Values</NavLink>
        <NavLink activeClassName='a-right-active' className='a-right no-border-left' to="/tab2">History</NavLink>
      </div>
      <Switch>
        <Route path="/tab2">
          <History tree={props.tree} history={props.history} />
        </Route>\
        <Route path="/h">
          <AtomView tree={props.tree} />
        </Route>
        <Route path="/">
          <AtomView tree={props.tree} />
        </Route>
      </Switch>
    </header>
  </Router>
);

export default Navbar;