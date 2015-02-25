'use strict';
/*jshint -W018, -W040, -W064, -W083, -W086 */
import React from 'react';
import { Route, RouteHandler, DefaultRoute, State } from 'react-router'; 
import { Flummox, Actions, Store } from 'flummox';
import { debounce } from './utils.js';
import DocumentTitle from 'react-document-title';
import request from 'superagent';
import 'babel/polyfill';

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
    let title = 'Search in GitHub: '+ query + ' //Isomorphic React Demo';
   
    return (
      <DocumentTitle title={title}>
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
            let languageName = (item.language ? item.language.toLowerCase().replace('#','sharp') : '');

            return <li key={item.id}>

              <div className="item-img">
                <img className="grow" src={item.owner.avatar_url}/>
                <a className={'item-name '+languageName} href={item.html_url} target="_blank">{item.full_name} ({item.language})</a>
                <div className="item-button-panel">
                  <a className="counter" href={item.html_url} target="_blank"><i className="fap fap-star"></i>{item.stargazers_count}</a>
                  <a className="counter" href={item.html_url} target="_blank"><i className="fap fap-watch"></i>{item.watchers_count}</a>
                  <a className="counter" href={item.html_url} target="_blank"><i className="fap fap-fork"></i>{item.forks_count}</a>
                </div>
              </div>
              
              <div className={'item-description '+languageName}>
                {item.description}
              </div>

            </li>;
          })}
          </ul>

        }  

      </div>
      </DocumentTitle>
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

