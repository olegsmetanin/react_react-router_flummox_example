import React from 'react';
import { Route, RouteHandler, DefaultRoute, State, Link, Redirect } from 'react-router';
import { Flummox, Actions, Store } from 'flummox';
import ItemList from './../components/ItemList.jsx';
import DocumentTitle from 'react-document-title';
import StickyMenu from './../components/StickyMenu.jsx';

let RepoHandler = React.createClass({
  mixins: [State],

  statics: {
    async routerWillRunOnServer(state, flux) {

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
    return this.AppStore.getItemDetails(this.getParams().owner, this.getParams().repo);
  },

  componentWillReceiveProps() {
    let appActions = this.context.flux.getActions('appActions');
    appActions.getItemDetails(this.getParams().owner, this.getParams().repo);
    this.setState(this.AppStore.getItemDetails(this.getParams().owner, this.getParams().repo));
  },

  componentDidMount () {
        
    this.AppStore.addListener('change', this.onAppStoreChange);
    let appActions = this.context.flux.getActions('appActions');
    appActions.getItemDetails(this.getParams().owner, this.getParams().repo);
  },

  componentWillUnmount() {
    this.AppStore.removeListener('change', this.onAppStoreChange);
  },

  onAppStoreChange () {
    this.setState(this.AppStore.getItemDetails(this.getParams().owner, this.getParams().repo));
  },

  render() {
    let repoFullName = this.state.repoFullName;
    let title = 'GitHub Repo: '+ repoFullName;

    var jsx;

    if (this.state.store_miss) {
      jsx = <DocumentTitle title={title}>
        <div>
          <div className="header">
            <div className="header-title">
              {title} 
            </div>

          </div>          

          <div className="spinner">
            <div className="rect1 dark"></div>
            <div className="rect2 dark"></div>
            <div className="rect3 dark"></div>
            <div className="rect4 dark"></div>
            <div className="rect5 dark"></div>
          </div>

        </div>
      </DocumentTitle>
    } else {

      let similarItems = this.state.similarItems;
      let readmeContent = this.state.readme;

      jsx = <DocumentTitle title={title}>
      <div>
        <div className="header">
          <div className="header-title">
            {title} 
          </div>

        </div>          

        <div className="readme">
          <div dangerouslySetInnerHTML={{__html: readmeContent}} />
        </div>

        <div className="itemlistheader">
          See also
        </div>
        
        <ItemList src={similarItems}/>


      </div>
      </DocumentTitle>
    } 
    return jsx;
  }
});

export default RepoHandler;