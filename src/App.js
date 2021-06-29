import React from 'react';
import { HashRouter as Router, Route, Redirect, Switch } from "react-router-dom";
//入口页面
import Login from './pages/login'
import Home from './pages/home'
function App() {

  return (
    <Router>
      <Switch>
        <Route path="/login" exact component={Login} />
        <Route path="/home" exact component={Home} />
        <Redirect from='/' exact to='/login'/>
      </Switch>
    </Router>
  );
}

export default App;