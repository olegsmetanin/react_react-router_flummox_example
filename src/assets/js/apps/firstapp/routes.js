import React from 'react';
import { Route, RouteHandler, DefaultRoute, State, Link, Redirect } from 'react-router';
import AppHandler from './handlers/AppHandler.jsx';
import SearchHandler from './handlers/SearchHandler.jsx';
import RepoHandler from './handlers/RepoHandler.jsx';
// <Redirect from="/" to="search" params={{query: 'javascript'}} /> - Error: Unhandled aborted transition! Reason: [object Object] on server https://github.com/rackt/react-router/issues/612
let routes = (
  <Route handler={AppHandler}>
    <Route name="home" path="/" handler={SearchHandler}/>
    <Route name="search" path="/search/?:query?" handler={SearchHandler}/>
    <Route name="repo" path="/repos/:owner/:repo" handler={RepoHandler}/>
  </Route>
  );

export default routes;