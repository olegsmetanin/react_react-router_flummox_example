'use strict';
/*jshint -W018, -W040, -W064, -W083, -W086 */
import React from 'react';
import { Route, RouteHandler, DefaultRoute, State } from 'react-router';
import Alt from 'alt';
import { debounce } from './utils.js';
import DocumentTitle from 'react-document-title';
import StickyMenu from './stickymenu.jsx';
import request from 'superagent';
import 'babel/polyfill';

// Actions

class AppActions {

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

    this.dispatch({query:query, items:items});
  }

}

// Store

class AppStore {

  constructor() {
    let appActionIds = this.alt.getActions('appActions');
    this.bindAction(appActionIds.searchItems, this.handleSearchItems);

    this.query = '';
    this.items = [];
  }

  handleSearchItems(queryAndItems) {
    this.query = queryAndItems.query;
    this.items = queryAndItems.items;
  }

  static getItems() {
    return this.getState().items;
  }

  static getQuery() {
    return this.getState().query;
  }

}

// AppHandler

let AppHandler = React.createClass({

  render() {
    return (
      <div>
      <i className="react fap fap-react"></i>
      <a className="fork" href="https://github.com/olegsmith/react_react-router_flummox_example"><i className="fap fap-fork"></i></a>

      <RouteHandler />
      </div>
      );
  },
});


// SearchHandler

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
    this.AppStore.listen(this.onAppStoreChange);
  },

  componentWillUnmount() {
    this.AppStore.unlisten(this.onAppStoreChange);
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

  handleFocus (e) {
  },

  render() {

    let items = this.state.items;
    let query = this.state.query;
    let title = 'Search in GitHub: '+ query + ' //Isomorphic React Demo';

    return (
      <DocumentTitle title={title}>
      <div>
        <div className="header">
          <div className="header-title">
            GitHub Search: Isomorphic React + Babel (es7) + React-Router + Flummox
          </div>

            <div>
              <StickyMenu className="searchpanel">
                <div className="searchwrap">
                  <div className="search">
                    <input type="text" value={query} onChange={this.handleChange} onFocus={this.handleFocus} placeholder="Search in GitHub"/>
                  </div>
                </div>
              </StickyMenu>
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
                <a className="waves-effect" href={item.html_url} target="_blank">
                  <img className="grow" src={item.owner.avatar_url}/>
                </a>
                <a className={'item-name '+languageName} href={item.html_url} target="_blank">{item.full_name} ({item.language})</a>
                <div className="item-button-panel">
                  <a className="waves-effect counter" href={item.html_url} target="_blank"><i className="fap fap-star"></i>{item.stargazers_count}</a>
                  <a className="waves-effect counter" href={item.html_url} target="_blank"><i className="fap fap-watch"></i>{item.watchers_count}</a>
                  <a className="waves-effect counter" href={item.html_url} target="_blank"><i className="fap fap-fork"></i>{item.forks_count}</a>
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

export class Flux extends Alt {
  constructor() {
    super();

    this.addActions('appActions', AppActions);
    this.addStore('appStore', AppStore);
  }
}

