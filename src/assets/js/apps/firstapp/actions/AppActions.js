/*jshint -W018, -W040, -W064, -W083, -W086 */

import { Flummox, Actions, Store } from 'flummox';
import httpRequest from './../services/HttpRequest.js';

class AppActions extends Actions {

  async searchItems(query) { 
    var items;
    
    if (query === '') {
      items = [];
    } else {  
      let response = await httpRequest
      .get(`https://api.github.com/search/repositories?q=${query}&sort=stars&order=desc`)
      .query({
        per_page: 50,
      })
      .exec();
      items = response.body.items;

    }
    return {query:query, items:items};
  }

  async getItemDetails(ownerName, repoName) {

      let details = httpRequest
      .get(`https://api.github.com/repos/${ownerName}/${repoName}`)
      .exec(); 

      var readme;
      if (typeof(window) === 'undefined') {
        readme = httpRequest
          .get(`https://api.github.com/repos/${ownerName}/${repoName}/readme`)    
          .set('Accept', 'application/vnd.github.V3.html')
          .parse(httpRequest.parse['text']) //!!! server only
          .exec();
      } else {
        readme = httpRequest
          .get(`https://api.github.com/repos/${ownerName}/${repoName}/readme`)    
          .set('Accept', 'application/vnd.github.V3.html')
          .exec(); 
      }

      let releases = httpRequest
      .get(`https://api.github.com/repos/${ownerName}/${repoName}/releases`)
      .exec();

      let stat = httpRequest
      .get(`https://api.github.com/repos/${ownerName}/${repoName}/stats/commit_activity`)
      .exec();

      let similarItems = httpRequest
      .get(`https://api.github.com/search/repositories?q=${repoName}&sort=stars&order=desc`)
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

      return {repoFullName: ownerName+'/'+repoName, details:combo[0].body, readme:readmeClientResponse, releases:combo[2].body, stat: combo[3].body, similarItems:combo[4].body.items};
  }

}

export default AppActions;