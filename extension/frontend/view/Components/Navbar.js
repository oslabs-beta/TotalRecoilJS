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

const Navbar = (props) => (
  <Router>
    <header className='navbar'>
      <div id='link-container'>
        <Link to="/tab1"><div className='navbaritem'>Current Atom Values</div></Link>
        <Link to="/tab2"><div className='navbaritem' id='tab2'>History</div></Link>
      </div>
      <Switch>
        <Route path="/tab1">
          <Atoms tree={props.tree} />
        </Route>
        <Route path="/tab2">
          <Users />
        </Route>
      </Switch>
    </header>
  </Router>
);

export default Navbar;