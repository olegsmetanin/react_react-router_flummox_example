import React from 'react';
import { Route, RouteHandler, DefaultRoute, State, Link, Redirect } from 'react-router';
import AppHandler from './handlers/AppHandler.jsx';
import SearchHandler from './handlers/SearchHandler.jsx';
import RepoHandler from './handlers/RepoHandler.jsx';

let routes = (
  <Route handler={AppHandler}>
    <Redirect from="/" to="search" params={{query: 'javascript'}} />
    <Route name="search" path="/search/?:query?" handler={SearchHandler}/>
    <Route name="repo" path="/repos/:owner/:repo" handler={RepoHandler}/>
  </Route>
  );

export default routes;