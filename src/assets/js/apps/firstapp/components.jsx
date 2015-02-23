'use strict';
import React from 'react';
import Router from 'react-router';
import { Route, RouteHandler, DefaultRoute, HistoryLocation, State } from 'react-router'; 
import { Flummox, Actions, Store } from 'flummox';

// Actions

var delay = time => new Promise(resolve => setTimeout(resolve, time));
  
class AppActions extends Actions {

  async getAllItems() { 
    await delay(1000);
    return {items:[{"time": new Date()}]};
  }

  async addNewItem(item) { 
    await delay(1000);
    return item;
  }

}

// Store

class AppStore extends Store { 

  constructor(flux) {
    super();

    let appActionIds = flux.getActionIds('appActions');
    this.register(appActionIds.getAllItems, this.handleGetAllItems);
    this.register(appActionIds.addNewItem, this.handleAddNewItem);

    this.state = {
      items:[]
    };

  }

  handleGetAllItems(items) {
    this.setState(items)
  }

  handleAddNewItem(item) {
    this.setState({items:[...this.state.items, item]})
  } 
  
  getAllItems () {
    return this.state.items;
  }

}

// AppHandler

let AppHandler = React.createClass({

  render() {
    return (
      <div>
      Application
      <RouteHandler />
      </div>
      );
  },
});

// HomeHandler

let HomeHandler = React.createClass({
  mixins: [State],

  statics: {
    async routerWillRun(state, flux) {
      let appActions = flux.getActions('appActions');

      return await appActions.getAllItems();
    }
  },

  contextTypes: {
    flux: React.PropTypes.object.isRequired,
  },

  getInitialState() {
    this.AppStore = this.context.flux.getStore('appStore');
    return {
      items: this.AppStore.getAllItems()
    }
  },

  componentDidMount() {
    this.AppStore.addListener('change', this.onAppStoreChange);
  },
  
  componentWillUnmount() {
    this.AppStore.removeListener('change', this.onAppStoreChange);
  },

  onAppStoreChange () {
    this.setState({
      items: this.AppStore.getAllItems()
    });
  },

  handleClick () {
    let appActions = this.context.flux.getActions('appActions');
    appActions.addNewItem({"time": new Date()});
  },

  render() {
    
    let currentState = JSON.stringify(this.state);

    return (
      <div>
      Home Page
      <div>{currentState}</div>
      <button onClick={this.handleClick}>async update</button>
      </div>
      );
  },
});

// routes

export let routes = (
  <Route handler={AppHandler}>
    <DefaultRoute handler={HomeHandler} />
    <Route name="home" path="/" handler={HomeHandler}/>
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
