/*jshint -W018, -W040, -W064, -W083, -W086 */

import React from 'react';
import { Route, RouteHandler, DefaultRoute, State, Link, Redirect } from 'react-router'; 

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
                <Link to="repo" params={{owner: item.owner.login, repo:item.name}} className={'item-name '+languageName}>{item.full_name} ({item.language})</Link>
                <div className="item-button-panel">
                  <Link to="repo" params={{owner: item.owner.login, repo:item.name}} className="waves-effect counter"><i className="fap fap-star"></i>{item.stargazers_count}</Link>
                  <Link to="repo" params={{owner: item.owner.login, repo:item.name}} className="waves-effect counter"><i className="fap fap-watch"></i>{item.watchers_count}</Link>
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

export default ItemList;