import { Flummox } from 'flummox';
import AppActions from './actions/AppActions.js';
import AppStore from './stores/AppStore.js';


export default class Flux extends Flummox {
  constructor() {
    super();

    this.createActions('appActions', AppActions);
    this.createStore('appStore', AppStore, this);
  }
}