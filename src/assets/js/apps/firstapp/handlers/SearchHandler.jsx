"use strict";
/*jshint -W018, -W040, -W064, -W083, -W086 */

import React from 'react';
import { Route, RouteHandler, DefaultRoute, State, Link, Redirect } from 'react-router';
import { Flummox, Actions, Store } from 'flummox';
import ItemList from './../components/ItemList.jsx';
import DocumentTitle from 'react-document-title';
import StickyMenu from './../components/StickyMenu.jsx';
 
import { debounce } from './../utils/Timer.js';  

let SearchHandler = React.createClass({
  mixins: [State],

  statics: {

    async routerWillRunOnServer(state, flux) {
      var query = 'javascript';
      if (state.path.indexOf('/search/') === 0) {
        query = state.path.substring(8);
      }

      state.params = {query:query};
      let appActions = flux.getActions('appActions');
      return await appActions.searchItems(query);
    },

    async routerWillRunOnClient(state, flux) {
      var query = 'javascript';
      if (state.path == '/') {
        state.params = {query:query};
      }
    }
  },
  
  contextTypes: {
    flux: React.PropTypes.object.isRequired,
  },

  getInitialState() {
    this.AppStore = this.context.flux.getStore('appStore');
    return this.AppStore.getSearchItems(this.getParams().query ? this.getParams().query : '');
  },

  componentWillMount () {
   this.handleSearchDebounced = debounce(function () {
     this.handleSearch.apply(this, [this.state.query]);
   }, 500);
  },

  componentDidMount() {
    this.AppStore.addListener('change', this.onAppStoreChange);
    let appActions = this.context.flux.getActions('appActions');
    appActions.searchItems(this.state.query);
  },

  componentWillUnmount() {
    this.AppStore.removeListener('change', this.onAppStoreChange);
  },

  onAppStoreChange () {
    this.setState(this.AppStore.getSearchItems(this.state.query));
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

    var jsx;
    var title;

    if (this.state.store_miss) {
      title = 'Search in GitHub: Loading //Isomorphic React Demo';

      jsx = <DocumentTitle title={title}>
      <div>
        <div className="header">
          <div className="header-title">
            GitHub Search: Isomorphic React + Babel (es7) + React-Router + Flummox 
          </div>

            <div>
              <StickyMenu className="searchpanel">
                <div className="searchwrap">
                  <div className="search">
                    Loading
                  </div>
                </div>
              </StickyMenu>
            </div>

        </div>          
        <div>
          <div className="spinner">
            <div className="rect1 dark"></div>
            <div className="rect2 dark"></div>
            <div className="rect3 dark"></div>
            <div className="rect4 dark"></div>
            <div className="rect5 dark"></div>
          </div>
        </div>
      </div>
      </DocumentTitle>
    } else {
      let items = this.state.items;
      let query = this.state.query;
      title = 'Search in GitHub: '+ query + ' //Isomorphic React Demo';

      jsx = <DocumentTitle title={title}>
      <div>
        <div className="header">
          <div className="header-title">
            GitHub Search: Isomorphic React + Babel (es7) + React-Router + Flummox 
          </div>

            <div>
              <StickyMenu className="searchpanel">
                <div className="searchwrap">
                  <div className="search">
                    <input type="text" value={query} onChange={this.handleChange} placeholder="Search in GitHub"/>
                  </div>
                </div>
              </StickyMenu>
            </div>

        </div>          

        <ItemList src={items}/>

      </div>
      </DocumentTitle>
    }
    return jsx;
  }
});

export default SearchHandler;