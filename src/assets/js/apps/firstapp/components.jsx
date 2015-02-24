'use strict';
import React from 'react';
import Router from 'react-router';
import { Route, RouteHandler, DefaultRoute, HistoryLocation, State } from 'react-router'; 
import { Flummox, Actions, Store } from 'flummox';
import { debounce } from './utils.js'
import request from 'superagent';
import from 'babel/polyfill';

// Actions

class AppActions extends Actions {

  async searchItems(query) { 
    var items;
    if (query === '') {
      items = [];
    } else {
      let response = await request
      .get(`https://api.github.com/search/repositories?q=${query}`)
      .query({
        per_page: 50,
      })
      .exec();
      items = response.body.items;

    }
    return {query:query, items:items};
  }

}

// Store

class AppStore extends Store { 

  constructor(flux) {
    super();

    let appActionIds = flux.getActionIds('appActions');
    this.register(appActionIds.searchItems, this.handleSearchItems);

    this.state = {
      query:'',
      items:[]
    };

  }

  handleSearchItems(queryAndItems) {
    this.setState(queryAndItems)
  }
  
  getItems () {
    return this.state.items;
  }

  getQuery () {
    return this.state.query;
  }

}

// AppHandler

let AppHandler = React.createClass({

  render() {
    return (
      <div>
      <a className="fork" href="https://github.com/olegsmith/react_react-router_flummox_example"><i className="fap fap-fork"></i></a>
      

      <div className="header">
        GitHub Search: Isomorphic React + Babel (es7) + React-Router + Flummox 
      </div>

      <RouteHandler />
      </div>
      );
  },
});

// HomeHandler

let SearchHandler = React.createClass({
  mixins: [State],

  statics: {
    async routerWillRun(state, flux) {

    var query = 'javascript';
    if (state.path.indexOf('/search/') === 0) {
      query = state.path.substring(8);
    }
    

    let appActions = flux.getActions('appActions');
    return await appActions.searchItems(query);
    }
  },

  contextTypes: {
    flux: React.PropTypes.object.isRequired,
  },

  getInitialState() {
    this.AppStore = this.context.flux.getStore('appStore');
    
    return {
      query:this.AppStore.getQuery(),
      items:this.AppStore.getItems()
    };
  },

  componentWillMount: function() {
   this.handleSearchDebounced = debounce(function () {
     this.handleSearch.apply(this, [this.state.query]);
   }, 500);
  },

  componentDidMount() {
    this.AppStore.addListener('change', this.onAppStoreChange);
  },

  componentWillUnmount() {
    this.AppStore.removeListener('change', this.onAppStoreChange);
  },

  onAppStoreChange () {
    this.setState({items:this.AppStore.getItems()});
  },


  handleChange (event) {
    let query = event.target.value;
    this.setState({query: query});
    this.handleSearchDebounced();

  },

  handleSearch (query) {
    var url   = query ? '#/search/' + encodeURIComponent(query) : '#/search/';
    history.replaceState({query:query}, "Search", url);
    let appActions = this.context.flux.getActions('appActions');
    appActions.searchItems(query);

  },

  render() {

    let items = this.state.items;
    let query = this.state.query;

    return (
      <div>
        <div className="searchpanel"> 
          <div className="search">
            <input type="text" value={query} onChange={this.handleChange} placeholder="Search in GitHub"/>
          </div>
        </div>

        {items.length === 0 ? 
      
          <div className="nodata">No data</div>
          
          :

          <ul className="itemlist">
          {items.map(function(item) {

            var itemNameClass='item-name ' + (item.language ? item.language.toLowerCase().replace('#','sharp') : '');

            return <li key={item.id}>

              <div className="item-img">
                <img src={item.owner.avatar_url}/>
                <div className={itemNameClass}>
                  <a href={item.html_url} target="_blank">{item.full_name} ({item.language})</a>
                </div>
                <div className="item-button-panel">
                  <div className="counter"><i className="fap fap-star"></i>{item.stargazers_count}</div>
                  <div className="counter"><i className="fap fap-watch"></i>{item.watchers_count}</div>
                  <div className="counter"><i className="fap fap-fork"></i>{item.forks_count}</div>
                </div>
              </div>
              
              <div className="item-description">
                {item.description}
              </div>

            </li>;
          })}
          </ul>

        }  

      </div>
    );
  }
});

// routes

export let routes = (
  <Route handler={AppHandler}>
  <DefaultRoute handler={SearchHandler} />
  <Route name="search" path="/search/?:query?" handler={SearchHandler}/>
  </Route>
  );


// Flux

export class Flux extends Flummox {
  constructor() {
    super();

    this.createActions('appActions', AppActions);
    this.createStore('appStore', AppStore, this);
  }
}


// Router.run!

export async function performRouteHandlerStaticMethod(routes, methodName, ...args) {
  return Promise.all(routes
    .map(route => route.handler[methodName])
    .filter(method => typeof method === 'function')
    .map(method => method(...args))
    );
}
