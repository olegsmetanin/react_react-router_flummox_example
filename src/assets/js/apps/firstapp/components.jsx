'use strict';
/*jshint -W018, -W040, -W064, -W083, -W086 */
import React from 'react';
import { Route, RouteHandler, DefaultRoute, State, Link } from 'react-router'; 
import { Flummox, Actions, Store } from 'flummox';
import { debounce } from './utils.js';
import DocumentTitle from 'react-document-title';
import StickyMenu from './stickymenu.jsx';
import request from 'superagent';
import { Base64 } from 'js-base64';
import 'babel/polyfill';

// Actions

class AppActions extends Actions {

  async searchItems(query) { 
    var items;
    if (query === '') {
      items = [];
    } else {
      let response = await request
      .get(`https://api.github.com/search/repositories?q=${query}&sort=stars&order=desc`)
      .query({
        per_page: 50,
      })
      .exec();
      items = response.body.items;

    }
    return {query:query, items:items};
  }

  async getItemDetails(owner,repo) {

      let details = request
      .get(`https://api.github.com/repos/${owner}/${repo}`)
      .exec(); 

      var readme;
      if (typeof(window) === 'undefined') {
        readme = request
          .get(`https://api.github.com/repos/${owner}/${repo}/readme`)    
          .set('Accept', 'application/vnd.github.V3.html')
          .parse(request.parse['text']) //!!!
          .exec();
      } else {
        readme = request
          .get(`https://api.github.com/repos/${owner}/${repo}/readme`)    
          .set('Accept', 'application/vnd.github.V3.html')
          .exec(); 
      }

      let releases = request
      .get(`https://api.github.com/repos/${owner}/${repo}/releases`)
      .exec();

      let stat = request
      .get(`https://api.github.com/repos/${owner}/${repo}/stats/commit_activity`)
      .exec();

      let similarItems = request
      .get(`https://api.github.com/search/repositories?q=${repo}&sort=stars&order=desc`)
      .query({
        per_page: 50,
      })
      .exec();

      let combo = await Promise.all([details, readme, releases, stat, similarItems]);

      var readmeClientResponse;
      if ((typeof(window) === 'undefined')) {
        readmeClientResponse = combo[1].res.text;
      } else {
        readmeClientResponse = combo[1].text;
      }

      return {details:combo[0].body, readme:readmeClientResponse, releases:combo[2].body, stat: combo[3].body, similarItems:combo[4].body.items};
  }

}

// Store

class AppStore extends Store { 

  constructor(flux) {
    super();

    let appActionIds = flux.getActionIds('appActions');
    this.register(appActionIds.searchItems, this.handleSearchItems);
    this.register(appActionIds.getItemDetails, this.handleGetItemDetails);

    this.state = {
      query:'',
      items:[],
      itemDetails:{}
    };

  }

  handleSearchItems(queryAndItems) {
    this.setState(queryAndItems)
  }

  handleGetItemDetails(itemDetails) {
    this.setState({itemDetails:itemDetails})
  }
  
  getItems () {
    return this.state.items;
  }

  getQuery () {
    return this.state.query;
  }

  getItemDetails () {
    return this.state.itemDetails;
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

// ItemList

let ItemList = React.createClass({
    render () {
      let items = this.props.src;
      var jsx;

      if (items.length === 0) {
        jsx = <div className="nodata">No data</div>;
      } else {
        jsx = <ul className="itemlist">
          {items.map(function(item) {
            let languageName = (item.language ? item.language.toLowerCase().replace('#','sharp') : '');

            return <li key={item.id}>

              <div className="item-img">
                <Link to="repo" params={{owner: item.owner.login, repo:item.name}} className="waves-effect">
                  <img className="grow" src={item.owner.avatar_url}/>
                </Link>
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

      return jsx;

    }

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

  componentWillMount () {
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

        <ItemList src={items}/>

      </div>
      </DocumentTitle>
    );
  }
});

// RepoHandler

let RepoHandler = React.createClass({
  mixins: [State],

  statics: {
    async routerWillRun(state, flux) {

    let ownerRepo = /repos\/(.*)\/(.*)/.exec(state.path);

    let appActions = flux.getActions('appActions');
    return await appActions.getItemDetails(ownerRepo[1],ownerRepo[2]);
    }
  },

  contextTypes: {
    flux: React.PropTypes.object.isRequired,
  },

  getInitialState() {    
    this.AppStore = this.context.flux.getStore('appStore');
    return this.AppStore.getItemDetails();
  },

  componentWillMount () {
  },

  componentDidMount () {
    this.AppStore.addListener('change', this.onAppStoreChange);
  },

  componentWillUnmount() {
    this.AppStore.removeListener('change', this.onAppStoreChange);
  },

  onAppStoreChange () {
    this.setState(this.AppStore.getItemDetails());
  },

  render() {
    let ownerRepoFullName = this.state.details.full_name;
    let similarItems = this.state.similarItems;
    let readmeContent = this.state.readme;

    let title = 'GitHub Repo: '+ ownerRepoFullName +' //Isomorphic React Demo';

    return (
      <DocumentTitle title={title}>
      <div>
        <div className="header">
          <div className="header-title">
            {title} 
          </div>

        </div>          

        <div dangerouslySetInnerHTML={{__html: readmeContent}} />
        
        <ItemList src={similarItems}/>

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
  <Route name="repo" path="/repos/:owner/:repo" handler={RepoHandler}/>
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

