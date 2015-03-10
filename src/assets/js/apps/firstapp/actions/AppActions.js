/*jshint -W018, -W040, -W064, -W083, -W086 */

import { Flummox, Actions, Store } from 'flummox';
import httpRequest from './../utils/HttpRequest.js';
import { PromiseUtils } from  './../utils/Promise.js';


class AppActions extends Actions {

  async searchItems(query) { 
    var items;
    
    if (query === '') {
      return {query:query, items:items};
    } else {  
      return await httpRequest
      .get(`https://api.github.com/search/repositories?q=${query}&sort=stars&order=desc`)
      .query({
        per_page: 50,
      })
      .exec()
      .then((val) => ({query:query, items:val.body.items}));
    }
  }

  async getItemDetails(ownerName, repoName) {

      let details = httpRequest
      .get(`https://api.github.com/repos/${ownerName}/${repoName}`)
      .exec()
      .then((resp) => resp.body); 

      var readme;
      if (typeof(window) === 'undefined') {
        readme = httpRequest
        .get(`https://api.github.com/repos/${ownerName}/${repoName}/readme`)    
        .set('Accept', 'application/vnd.github.V3.html')
        .parse(httpRequest.parse['text']) //!!! server only
        .exec()
        .then((resp) => resp.res.text);
      } else {
        readme = httpRequest
        .get(`https://api.github.com/repos/${ownerName}/${repoName}/readme`)    
        .set('Accept', 'application/vnd.github.V3.html')
        .exec()
        .then((resp) => resp.text); 
      }

      let releases = httpRequest
      .get(`https://api.github.com/repos/${ownerName}/${repoName}/releases`)
      .exec()
      .then((resp) => resp.body);

      let statRequest = () => httpRequest
      .get(`https://api.github.com/repos/${ownerName}/${repoName}/stats/commit_activity`)
      .exec()

      let stat = PromiseUtils.retry({
        what: () => httpRequest
          .get(`https://api.github.com/repos/${ownerName}/${repoName}/stats/commit_activity`)
          .exec(),
        when: (resp, counter) => (resp.status == 202 && counter < 3),
        wait: (counter) => counter*1000
      })
      .then((resp) => resp.body);

      let similarItems = httpRequest
      .get(`https://api.github.com/search/repositories?q=${repoName}&sort=stars&order=desc`)
      .query({
        per_page: 50,
      })
      .exec()
      .then((resp) => resp.body.items)

      return Promise
      .all([details, readme, releases, stat, similarItems])
      .then( 
        (val) => ({repoFullName: ownerName+'/'+repoName, details:val[0], readme:val[1], releases:val[2], stat:val[3], similarItems:val[4]}),
        (error) => ({repoFullName: ownerName+'/'+repoName, error:error})
      );
  }

}

export default AppActions;