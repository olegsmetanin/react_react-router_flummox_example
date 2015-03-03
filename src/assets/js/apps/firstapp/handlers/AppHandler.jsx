import React from 'react';
import { Route, RouteHandler, DefaultRoute, State, Link, Redirect } from 'react-router'; 

let AppHandler = React.createClass({

  render() {
    return (
      <div>
      <Link to="search" params={{query:'javascript'}}><i className="react fap fap-react"></i></Link>
      <a className="fork" href="https://github.com/olegsmith/react_react-router_flummox_example"><i className="fap fap-fork"></i></a>

      <RouteHandler />
      </div>
      );
  },
});

export default AppHandler;