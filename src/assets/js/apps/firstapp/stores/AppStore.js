import { Flummox, Actions, Store } from 'flummox';
import LRU from 'lru-cache';

class AppStore extends Store { 

  constructor(flux) {
    super();

    let appActionIds = flux.getActionIds('appActions');
    this.register(appActionIds.searchItems, this.handleSearchItems);
    this.register(appActionIds.getItemDetails, this.handleGetItemDetails);

    this._searchItemsLRU = LRU(20);
    this._itemsDetailsLRU = LRU(20);

    this.state = {};

  }

  handleSearchItems(queryAndItems) {
    this._searchItemsLRU.set(queryAndItems.query, queryAndItems);
    this.emit('change');
  }

  handleGetItemDetails(itemDetails) {
    this._itemsDetailsLRU.set(itemDetails.repoFullName, itemDetails);
    this.emit('change');
  }
  
  getSearchItems(query) {
    
    var res;
    if (this._searchItemsLRU.has(query)) {
      res = this._searchItemsLRU.get(query);
      res.store_miss = false;
    } else {
      res = {query: query, store_miss: true}
    }
    return res;
  }

  getItemDetails(ownerName, repoName) {

    var repoFullName = ownerName+ '/'+repoName;
    var res;
    if (this._itemsDetailsLRU.has(repoFullName)) {
      res = this._itemsDetailsLRU.get(repoFullName)
      res.store_miss = false;
    } else {
      res = {repoFullName: repoFullName, store_miss: true}
    }
    return res;
  }

}

export default AppStore;