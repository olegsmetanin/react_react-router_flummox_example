require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;

function drainQueue() {
    if (draining) {
        return;
    }
    draining = true;
    var currentQueue;
    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        var i = -1;
        while (++i < len) {
            currentQueue[i]();
        }
        len = queue.length;
    }
    draining = false;
}
process.nextTick = function (fun) {
    queue.push(fun);
    if (!draining) {
        setTimeout(drainQueue, 0);
    }
};

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],2:[function(require,module,exports){
'use strict';

var React = require('react'),
    createSideEffect = require('react-side-effect');

var _serverTitle = null;

function getTitleFromPropsList(propsList) {
  var innermostProps = propsList[propsList.length - 1];
  if (innermostProps) {
    return innermostProps.title;
  }
}

var DocumentTitle = createSideEffect(function handleChange(propsList) {
  var title = getTitleFromPropsList(propsList);

  if (typeof document !== 'undefined') {
    document.title = title || '';
  } else {
    _serverTitle = title || null;
  }
}, {
  displayName: 'DocumentTitle',

  propTypes: {
    title: React.PropTypes.string.isRequired
  },

  statics: {
    peek: function () {
      return _serverTitle;
    },

    rewind: function () {
      var title = _serverTitle;
      this.dispose();
      return title;
    }
  }
});

module.exports = DocumentTitle;
},{"react":"react","react-side-effect":3}],3:[function(require,module,exports){
'use strict';

var React = require('react'),
    invariant = require('react/lib/invariant'),
    shallowEqual = require('react/lib/shallowEqual');

function createSideEffect(onChange, mixin) {
  invariant(
    typeof onChange === 'function',
    'onChange(propsList) is a required argument.'
  );

  var mountedInstances = [];

  function emitChange() {
    onChange(mountedInstances.map(function (instance) {
      return instance.props;
    }));
  }

  return React.createClass({
    mixins: [mixin],

    statics: {
      dispose: function () {
        mountedInstances = [];
        emitChange();
      }
    },

    shouldComponentUpdate: function (nextProps) {
      return !shallowEqual(nextProps, this.props);
    },

    componentWillMount: function () {
      mountedInstances.push(this);
      emitChange();
    },

    componentDidUpdate: function () {
      emitChange();
    },

    componentWillUnmount: function () {
      var index = mountedInstances.indexOf(this);
      mountedInstances.splice(index, 1);
      emitChange();
    },

    render: function () {
      if (this.props.children) {
        return React.Children.only(this.props.children);
      } else {
        return null;
      }
    }
  });
}

module.exports = createSideEffect;
},{"react":"react","react/lib/invariant":4,"react/lib/shallowEqual":5}],4:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule invariant
 */

"use strict";

/**
 * Use invariant() to assert state which your program assumes to be true.
 *
 * Provide sprintf-style format (only %s is supported) and arguments
 * to provide information about what broke and what you were
 * expecting.
 *
 * The invariant message will be stripped in production, but the invariant
 * will remain to ensure logic does not differ in production.
 */

var invariant = function(condition, format, a, b, c, d, e, f) {
  if ("production" !== process.env.NODE_ENV) {
    if (format === undefined) {
      throw new Error('invariant requires an error message argument');
    }
  }

  if (!condition) {
    var error;
    if (format === undefined) {
      error = new Error(
        'Minified exception occurred; use the non-minified dev environment ' +
        'for the full error message and additional helpful warnings.'
      );
    } else {
      var args = [a, b, c, d, e, f];
      var argIndex = 0;
      error = new Error(
        'Invariant Violation: ' +
        format.replace(/%s/g, function() { return args[argIndex++]; })
      );
    }

    error.framesToPop = 1; // we don't care about invariant's own frame
    throw error;
  }
};

module.exports = invariant;

}).call(this,require('_process'))

},{"_process":1}],5:[function(require,module,exports){
/**
 * Copyright 2013-2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule shallowEqual
 */

"use strict";

/**
 * Performs equality by iterating through keys on an object and returning
 * false when any key has values which are not strictly equal between
 * objA and objB. Returns true when the values of all keys are strictly equal.
 *
 * @return {boolean}
 */
function shallowEqual(objA, objB) {
  if (objA === objB) {
    return true;
  }
  var key;
  // Test for A's keys different from B.
  for (key in objA) {
    if (objA.hasOwnProperty(key) &&
        (!objB.hasOwnProperty(key) || objA[key] !== objB[key])) {
      return false;
    }
  }
  // Test for B's keys missing from A.
  for (key in objB) {
    if (objB.hasOwnProperty(key) && !objA.hasOwnProperty(key)) {
      return false;
    }
  }
  return true;
}

module.exports = shallowEqual;

},{}],6:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Flummox = require("flummox").Flummox;

var AppActions = _interopRequire(require("./actions/AppActions.js"));

var AppStore = _interopRequire(require("./stores/AppStore.js"));

var Flux = (function (Flummox) {
  function Flux() {
    _classCallCheck(this, Flux);

    _get(Object.getPrototypeOf(Flux.prototype), "constructor", this).call(this);

    this.createActions("appActions", AppActions);
    this.createStore("appStore", AppStore, this);
  }

  _inherits(Flux, Flummox);

  return Flux;
})(Flummox);

module.exports = Flux;

},{"./actions/AppActions.js":7,"./stores/AppStore.js":18,"flummox":"flummox"}],7:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*jshint -W018, -W040, -W064, -W083, -W086 */

var _flummox = require("flummox");

var Flummox = _flummox.Flummox;
var Actions = _flummox.Actions;
var Store = _flummox.Store;

var httpRequest = _interopRequire(require("./../services/HttpRequest.js"));

var AppActions = (function (Actions) {
  function AppActions() {
    _classCallCheck(this, AppActions);

    if (Actions != null) {
      Actions.apply(this, arguments);
    }
  }

  _inherits(AppActions, Actions);

  _prototypeProperties(AppActions, null, {
    searchItems: {
      value: function searchItems(query) {
        var items;
        return regeneratorRuntime.async(function searchItems$(context$2$0) {
          while (1) switch (context$2$0.prev = context$2$0.next) {
            case 0:
              if (!(query === "")) {
                context$2$0.next = 4;
                break;
              }

              return context$2$0.abrupt("return", { query: query, items: items });

            case 4:
              context$2$0.next = 6;
              return httpRequest.get("https://api.github.com/search/repositories?q=" + query + "&sort=stars&order=desc").query({
                per_page: 50 }).exec().then(function (val) {
                return { query: query, items: val.body.items };
              });

            case 6:
              return context$2$0.abrupt("return", context$2$0.sent);

            case 7:
            case "end":
              return context$2$0.stop();
          }
        }, null, this);
      },
      writable: true,
      configurable: true
    },
    getItemDetails: {
      value: function getItemDetails(ownerName, repoName) {
        var details, readme, releases, stat, similarItems;
        return regeneratorRuntime.async(function getItemDetails$(context$2$0) {
          while (1) switch (context$2$0.prev = context$2$0.next) {
            case 0:
              details = httpRequest.get("https://api.github.com/repos/" + ownerName + "/" + repoName).exec().then(function (resp) {
                return resp.body;
              });

              if (typeof window === "undefined") {
                readme = httpRequest.get("https://api.github.com/repos/" + ownerName + "/" + repoName + "/readme").set("Accept", "application/vnd.github.V3.html").parse(httpRequest.parse.text) //!!! server only
                .exec().then(function (resp) {
                  return resp.res.text;
                });
              } else {
                readme = httpRequest.get("https://api.github.com/repos/" + ownerName + "/" + repoName + "/readme").set("Accept", "application/vnd.github.V3.html").exec().then(function (resp) {
                  return resp.text;
                });
              }

              releases = httpRequest.get("https://api.github.com/repos/" + ownerName + "/" + repoName + "/releases").exec().then(function (resp) {
                return resp.body;
              });
              stat = httpRequest.get("https://api.github.com/repos/" + ownerName + "/" + repoName + "/stats/commit_activity").exec().then(function (resp) {
                return resp.body;
              });
              similarItems = httpRequest.get("https://api.github.com/search/repositories?q=" + repoName + "&sort=stars&order=desc").query({
                per_page: 50 }).exec().then(function (resp) {
                return resp.body.items;
              });
              return context$2$0.abrupt("return", Promise.all([details, readme, releases, stat, similarItems]).then(function (val) {
                return { repoFullName: ownerName + "/" + repoName, details: val[0], readme: val[1], releases: val[2], stat: val[3], similarItems: val[4] };
              }, function (error) {
                return { repoFullName: ownerName + "/" + repoName, error: error };
              }));

            case 6:
            case "end":
              return context$2$0.stop();
          }
        }, null, this);
      },
      writable: true,
      configurable: true
    }
  });

  return AppActions;
})(Actions);

module.exports = AppActions;

},{"./../services/HttpRequest.js":17,"flummox":"flummox"}],8:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

/*jshint -W018, -W040, -W064, -W083, -W086 */

var React = _interopRequire(require("react"));

var d3 = _interopRequire(require("d3"));

var AreaChart = React.createClass({
  displayName: "AreaChart",

  componentDidMount: function componentDidMount() {
    this.redraw();
    if (window) {
      window.addEventListener("resize", this.onResize);
    }
  },

  redraw: function redraw() {

    var data = this.props.data;

    var el = this.getDOMNode();
    var child = el.childNodes[0];
    if (child) {
      el.removeChild(child);
    }

    if (data.length !== 0) {

      var w = el.clientWidth;
      var h = el.clientHeight;

      var svg = d3.select(el).append("svg").attr("width", w).attr("height", h).append("g").attr("transform", "translate(50,50)");

      var x = d3.time.scale().range([0, w - 100]);

      var y = d3.scale.linear().range([h - 100, 0]);

      var xAxis = d3.svg.axis().scale(x).orient("bottom").tickFormat(d3.time.format("%b"));

      var xAxis2 = d3.svg.axis().scale(x).orient("bottom").ticks(d3.time.years, 1).tickFormat(d3.time.format("%Y"));

      var yAxis = d3.svg.axis().scale(y).orient("left");

      var line = d3.svg.line().interpolate("basis").x(function (d) {
        return x(d[0]);
      }).y(function (d) {
        return y(d[1]);
      });

      x.domain([data[0][0], data[data.length - 1][0]]);
      y.domain(d3.extent(data, function (d) {
        return d[1];
      }));

      svg.append("g").attr("class", "x axis").attr("transform", "translate(0," + (h - 100) + ")").call(xAxis);
      svg.append("g").attr("class", "x axis").attr("transform", "translate(0," + (h - 180) + ")").call(xAxis2);

      svg.append("g").attr("class", "y axis").call(yAxis).append("text").attr("transform", "rotate(-90)").attr("y", 6).attr("dy", ".71em").style("text-anchor", "end");

      svg.append("path").datum(data).attr("class", "line").attr("d", line);

      this._svg = svg;
    }
  },

  componentWillUnmount: function componentWillUnmount() {
    if (window) {
      window.removeEventListener("resize", this.onResize);
    }
  },

  onResize: function onResize(e) {
    this.redraw();
  },

  render: function render() {
    return React.createElement("div", { className: "chartwrap" });
  }
});

module.exports = AreaChart;

},{"d3":"d3","react":"react"}],9:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

/*jshint -W018, -W040, -W064, -W083, -W086 */

var React = _interopRequire(require("react"));

var _reactRouter = require("react-router");

var Route = _reactRouter.Route;
var RouteHandler = _reactRouter.RouteHandler;
var DefaultRoute = _reactRouter.DefaultRoute;
var State = _reactRouter.State;
var Link = _reactRouter.Link;
var Redirect = _reactRouter.Redirect;

var ItemList = React.createClass({
  displayName: "ItemList",

  render: function render() {
    var items = this.props.src;
    var jsx;

    if (items.length === 0) {
      jsx = React.createElement(
        "div",
        { className: "nodata" },
        "No data"
      );
    } else {
      jsx = React.createElement(
        "ul",
        { className: "itemlist" },
        items.map(function (item) {
          var languageName = item.language ? item.language.toLowerCase().replace("#", "sharp") : "";

          return React.createElement(
            "li",
            { key: item.id },
            React.createElement(
              "div",
              { className: "item-img" },
              React.createElement(
                Link,
                { to: "repo", params: { owner: item.owner.login, repo: item.name }, className: "waves-effect" },
                React.createElement("img", { className: "grow", src: item.owner.avatar_url })
              ),
              React.createElement(
                Link,
                { to: "repo", params: { owner: item.owner.login, repo: item.name }, className: "item-name " + languageName },
                item.full_name,
                " (",
                item.language,
                ")"
              ),
              React.createElement(
                "div",
                { className: "item-button-panel" },
                React.createElement(
                  Link,
                  { to: "repo", params: { owner: item.owner.login, repo: item.name }, className: "waves-effect counter" },
                  React.createElement("i", { className: "fap fap-star" }),
                  item.stargazers_count
                ),
                React.createElement(
                  Link,
                  { to: "repo", params: { owner: item.owner.login, repo: item.name }, className: "waves-effect counter" },
                  React.createElement("i", { className: "fap fap-watch" }),
                  item.watchers_count
                ),
                React.createElement(
                  "a",
                  { className: "waves-effect counter", href: item.html_url, target: "_blank" },
                  React.createElement("i", { className: "fap fap-fork" }),
                  item.forks_count
                )
              )
            ),
            React.createElement(
              "div",
              { className: "item-description " + languageName },
              item.description
            )
          );
        })
      );
    }

    return jsx;
  }

});

module.exports = ItemList;

},{"react":"react","react-router":"react-router"}],10:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

/*jshint -W018, -W040, -W064, -W083, -W086 */

var React = _interopRequire(require("react"));

var StickyMenu = React.createClass({
    displayName: "StickyMenu",

    componentDidMount: function componentDidMount() {
        this.calculatePositions();

        if (window) {
            window.addEventListener("scroll", this.onPageScroll);
            window.addEventListener("resize", this.onResize);
        }
    },

    componentWillUnmount: function componentWillUnmount() {
        if (window) {
            window.removeEventListener("scroll", this.onPageScroll);
            window.removeEventListener("resize", this.onResize);
        }
    },

    calculatePositions: function calculatePositions() {
        this._top = this.getDOMNode().parentNode.offsetTop;
        this.getDOMNode().parentNode.style.minHeight = this.getDOMNode().clientHeight + "px";
    },

    onResize: function onResize(e) {
        this.calculatePositions();
        this.onPageScroll();
    },

    onPageScroll: function onPageScroll() {
        if (window.scrollY >= this._top) {
            this.getDOMNode().classList.add("sticky");
        } else {
            this.getDOMNode().classList.remove("sticky");
        }
    },

    render: function render() {
        return React.createElement(
            "div",
            { className: this.props.className },
            this.props.children
        );
    }

});

module.exports = StickyMenu;

},{"react":"react"}],11:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var React = _interopRequire(require("react"));

var _reactRouter = require("react-router");

var Route = _reactRouter.Route;
var RouteHandler = _reactRouter.RouteHandler;
var DefaultRoute = _reactRouter.DefaultRoute;
var State = _reactRouter.State;
var Link = _reactRouter.Link;
var Redirect = _reactRouter.Redirect;

var AppHandler = React.createClass({
  displayName: "AppHandler",

  render: function render() {
    return React.createElement(
      "div",
      null,
      React.createElement(
        Link,
        { to: "search", params: { query: "javascript" } },
        React.createElement("i", { className: "react fap fap-react" })
      ),
      React.createElement(
        "a",
        { className: "fork", href: "https://github.com/olegsmith/react_react-router_flummox_example" },
        React.createElement("i", { className: "fap fap-fork" })
      ),
      React.createElement(RouteHandler, null)
    );
  } });

module.exports = AppHandler;

},{"react":"react","react-router":"react-router"}],12:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var React = _interopRequire(require("react"));

var _reactRouter = require("react-router");

var Route = _reactRouter.Route;
var RouteHandler = _reactRouter.RouteHandler;
var DefaultRoute = _reactRouter.DefaultRoute;
var State = _reactRouter.State;
var Link = _reactRouter.Link;
var Redirect = _reactRouter.Redirect;

var _flummox = require("flummox");

var Flummox = _flummox.Flummox;
var Actions = _flummox.Actions;
var Store = _flummox.Store;

var ItemList = _interopRequire(require("./../components/ItemList.jsx"));

var DocumentTitle = _interopRequire(require("react-document-title"));

var StickyMenu = _interopRequire(require("./../components/StickyMenu.jsx"));

var AreaChart = _interopRequire(require("./../components/AreaChart.jsx"));

require("./../utils/FlatMap.js");

var RepoHandler = React.createClass({
  displayName: "RepoHandler",

  mixins: [State],

  statics: {
    routerWillRunOnServer: function routerWillRunOnServer(state, flux) {
      var ownerRepo, appActions;
      return regeneratorRuntime.async(function routerWillRunOnServer$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
          case 0:
            ownerRepo = /repos\/(.*)\/(.*)/.exec(state.path);
            appActions = flux.getActions("appActions");
            context$1$0.next = 4;
            return appActions.getItemDetails(ownerRepo[1], ownerRepo[2]);

          case 4:
            return context$1$0.abrupt("return", context$1$0.sent);

          case 5:
          case "end":
            return context$1$0.stop();
        }
      }, null, this);
    }
  },

  contextTypes: {
    flux: React.PropTypes.object.isRequired },

  getInitialState: function getInitialState() {
    this.AppStore = this.context.flux.getStore("appStore");
    return this.AppStore.getItemDetails(this.getParams().owner, this.getParams().repo);
  },

  componentWillReceiveProps: function componentWillReceiveProps() {
    var appActions = this.context.flux.getActions("appActions");
    appActions.getItemDetails(this.getParams().owner, this.getParams().repo);
    this.setState(this.AppStore.getItemDetails(this.getParams().owner, this.getParams().repo));
  },

  componentDidMount: function componentDidMount() {

    this.AppStore.addListener("change", this.onAppStoreChange);
    var appActions = this.context.flux.getActions("appActions");
    appActions.getItemDetails(this.getParams().owner, this.getParams().repo);
  },

  componentWillUnmount: function componentWillUnmount() {
    this.AppStore.removeListener("change", this.onAppStoreChange);
  },

  onAppStoreChange: function onAppStoreChange() {
    this.setState(this.AppStore.getItemDetails(this.getParams().owner, this.getParams().repo));
  },

  render: function render() {
    var repoFullName = this.state.repoFullName;
    var title = "GitHub Repo: " + repoFullName;

    var jsx;

    if (this.state.store_miss) {
      jsx = React.createElement(
        DocumentTitle,
        { title: title },
        React.createElement(
          "div",
          null,
          React.createElement(
            "div",
            null,
            React.createElement(
              StickyMenu,
              { className: "header" },
              React.createElement(
                "div",
                { className: "header-title" },
                title
              )
            )
          ),
          React.createElement(
            "div",
            { className: "spinner" },
            React.createElement("div", { className: "rect1 dark" }),
            React.createElement("div", { className: "rect2 dark" }),
            React.createElement("div", { className: "rect3 dark" }),
            React.createElement("div", { className: "rect4 dark" }),
            React.createElement("div", { className: "rect5 dark" })
          )
        )
      );
    } else {
      var details = this.state.details;
      var data;

      if (Array.isArray(this.state.stat)) {
        data = this.state.stat.flatMap(function (_ref) {
          var days = _ref.days;
          var total = _ref.total;
          var week = _ref.week;
          return days.map(function (d, i) {
            return [(week + i * 60 * 60 * 24) * 1000, d];
          });
        });
      } else {
        data = [];
      }

      var similarItems = this.state.similarItems;
      var readmeContent = this.state.readme;
      var avatar_url = details.owner && details.owner.avatar_url ? details.owner.avatar_url : "https://cdn2.iconfinder.com/data/icons/metro-ui-dock/512/User_No-Frame.png";

      jsx = React.createElement(
        DocumentTitle,
        { title: title },
        React.createElement(
          "div",
          null,
          React.createElement(
            "div",
            null,
            React.createElement(
              StickyMenu,
              { className: "header" },
              React.createElement(
                "div",
                { className: "header-title" },
                title
              )
            )
          ),
          React.createElement(
            "div",
            { className: "repoheader" },
            React.createElement(
              "div",
              { className: "avatar" },
              React.createElement("img", { className: "grow", src: avatar_url })
            ),
            React.createElement(
              "div",
              { className: "chartwrap" },
              React.createElement(AreaChart, { data: data })
            )
          ),
          React.createElement(
            "div",
            { className: "readme" },
            React.createElement("div", { dangerouslySetInnerHTML: { __html: readmeContent } })
          ),
          React.createElement(
            "div",
            { className: "itemlistheader" },
            "See also"
          ),
          React.createElement(ItemList, { src: similarItems })
        )
      );
    }
    return jsx;
  }
});

module.exports = RepoHandler;

},{"./../components/AreaChart.jsx":8,"./../components/ItemList.jsx":9,"./../components/StickyMenu.jsx":10,"./../utils/FlatMap.js":19,"flummox":"flummox","react":"react","react-document-title":2,"react-router":"react-router"}],13:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var React = _interopRequire(require("react"));

var _reactRouter = require("react-router");

var Route = _reactRouter.Route;
var RouteHandler = _reactRouter.RouteHandler;
var DefaultRoute = _reactRouter.DefaultRoute;
var State = _reactRouter.State;
var Link = _reactRouter.Link;
var Redirect = _reactRouter.Redirect;

var _flummox = require("flummox");

var Flummox = _flummox.Flummox;
var Actions = _flummox.Actions;
var Store = _flummox.Store;

var ItemList = _interopRequire(require("./../components/ItemList.jsx"));

var DocumentTitle = _interopRequire(require("react-document-title"));

var StickyMenu = _interopRequire(require("./../components/StickyMenu.jsx"));

var debounce = require("./../utils/Utils.js").debounce;

var SearchHandler = React.createClass({
  displayName: "SearchHandler",

  mixins: [State],

  statics: {

    routerWillRunOnServer: function routerWillRunOnServer(state, flux) {
      var query, appActions;
      return regeneratorRuntime.async(function routerWillRunOnServer$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
          case 0:
            query = "javascript";

            if (state.path.indexOf("/search/") === 0) {
              query = state.path.substring(8);
            }

            appActions = flux.getActions("appActions");
            context$1$0.next = 5;
            return appActions.searchItems(query);

          case 5:
            return context$1$0.abrupt("return", context$1$0.sent);

          case 6:
          case "end":
            return context$1$0.stop();
        }
      }, null, this);
    }
  },

  contextTypes: {
    flux: React.PropTypes.object.isRequired },

  getInitialState: function getInitialState() {
    this.AppStore = this.context.flux.getStore("appStore");
    return this.AppStore.getSearchItems(this.getParams().query ? this.getParams().query : "");
  },

  componentWillMount: function componentWillMount() {
    this.handleSearchDebounced = debounce(function () {
      this.handleSearch.apply(this, [this.state.query]);
    }, 500);
  },

  componentDidMount: function componentDidMount() {
    this.AppStore.addListener("change", this.onAppStoreChange);
    var appActions = this.context.flux.getActions("appActions");
    appActions.searchItems(this.state.query);
  },

  componentWillUnmount: function componentWillUnmount() {
    this.AppStore.removeListener("change", this.onAppStoreChange);
  },

  onAppStoreChange: function onAppStoreChange() {
    this.setState(this.AppStore.getSearchItems(this.state.query));
  },

  handleChange: function handleChange(event) {
    var query = event.target.value;
    this.setState({ query: query });
    this.handleSearchDebounced();
  },

  handleSearch: function handleSearch(query) {
    var url = query ? "#/search/" + encodeURIComponent(query) : "#/search/";
    history.replaceState({ query: query }, "Search", url);
    var appActions = this.context.flux.getActions("appActions");
    appActions.searchItems(query);
  },

  render: function render() {

    var jsx;
    var title;

    if (this.state.store_miss) {
      title = "Search in GitHub: Loading //Isomorphic React Demo";

      jsx = React.createElement(
        DocumentTitle,
        { title: title },
        React.createElement(
          "div",
          null,
          React.createElement(
            "div",
            { className: "header" },
            React.createElement(
              "div",
              { className: "header-title" },
              "GitHub Search: Isomorphic React + Babel (es7) + React-Router + Flummox"
            ),
            React.createElement(
              "div",
              null,
              React.createElement(
                StickyMenu,
                { className: "searchpanel" },
                React.createElement(
                  "div",
                  { className: "searchwrap" },
                  React.createElement(
                    "div",
                    { className: "search" },
                    "Loading"
                  )
                )
              )
            )
          ),
          React.createElement(
            "div",
            null,
            React.createElement(
              "div",
              { className: "spinner" },
              React.createElement("div", { className: "rect1 dark" }),
              React.createElement("div", { className: "rect2 dark" }),
              React.createElement("div", { className: "rect3 dark" }),
              React.createElement("div", { className: "rect4 dark" }),
              React.createElement("div", { className: "rect5 dark" })
            )
          )
        )
      );
    } else {
      var items = this.state.items;
      var query = this.state.query;
      title = "Search in GitHub: " + query + " //Isomorphic React Demo";

      jsx = React.createElement(
        DocumentTitle,
        { title: title },
        React.createElement(
          "div",
          null,
          React.createElement(
            "div",
            { className: "header" },
            React.createElement(
              "div",
              { className: "header-title" },
              "GitHub Search: Isomorphic React + Babel (es7) + React-Router + Flummox"
            ),
            React.createElement(
              "div",
              null,
              React.createElement(
                StickyMenu,
                { className: "searchpanel" },
                React.createElement(
                  "div",
                  { className: "searchwrap" },
                  React.createElement(
                    "div",
                    { className: "search" },
                    React.createElement("input", { type: "text", value: query, onChange: this.handleChange, placeholder: "Search in GitHub" })
                  )
                )
              )
            )
          ),
          React.createElement(ItemList, { src: items })
        )
      );
    }
    return jsx;
  }
});

module.exports = SearchHandler;

},{"./../components/ItemList.jsx":9,"./../components/StickyMenu.jsx":10,"./../utils/Utils.js":20,"flummox":"flummox","react":"react","react-document-title":2,"react-router":"react-router"}],14:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

/*jshint -W018, -W040, -W064, -W083, -W086 */

var React = _interopRequire(require("react"));

var Router = _interopRequire(require("react-router"));

var Flux = _interopRequire(require("./Flux.js"));

var routes = _interopRequire(require("./routes.js"));

var performRouteHandlerStaticMethod = require("./utils/Utils.js").performRouteHandlerStaticMethod;

require("babel/polyfill");

require("./libs/waves.js");

var attachFastClick = _interopRequire(require("fastclick"));

window.Waves.displayEffect();
attachFastClick(document.body);

module.exports = function (divid) {

  var flux = new Flux();

  Router.run(routes, function (Handler, state) {

    function run() {
      return regeneratorRuntime.async(function run$(context$3$0) {
        while (1) switch (context$3$0.prev = context$3$0.next) {
          case 0:
            context$3$0.next = 2;
            return performRouteHandlerStaticMethod(state.routes, "routerWillRun", state, flux);

          case 2:

            React.withContext({ flux: flux }, function () {
              return React.render(React.createElement(Handler, null), document.getElementById(divid));
            });

          case 3:
          case "end":
            return context$3$0.stop();
        }
      }, null, this);
    }

    run()["catch"](function (error) {
      throw error;
    });
  });
};

},{"./Flux.js":6,"./libs/waves.js":15,"./routes.js":16,"./utils/Utils.js":20,"babel/polyfill":"babel/polyfill","fastclick":"fastclick","react":"react","react-router":"react-router"}],15:[function(require,module,exports){
"use strict";

/*!
 * Waves v0.6.0
 * http://fian.my.id/Waves 
 * 
 * Copyright 2014 Alfiana E. Sibuea and other contributors 
 * Released under the MIT license 
 * https://github.com/fians/Waves/blob/master/LICENSE 
 */
/* global SVGElement */
;(function (window) {

    var Waves = Waves || {};
    var $$ = document.querySelectorAll.bind(document);

    // Find exact position of element
    function isWindow(obj) {
        return obj !== null && obj === obj.window;
    }

    function getWindow(elem) {
        return isWindow(elem) ? elem : elem.nodeType === 9 && elem.defaultView;
    }

    function offset(elem) {
        var docElem,
            win,
            box = { top: 0, left: 0 },
            doc = elem && elem.ownerDocument;

        docElem = doc.documentElement;

        if (typeof elem.getBoundingClientRect !== typeof undefined) {
            box = elem.getBoundingClientRect();
        }
        win = getWindow(doc);
        return {
            top: box.top + win.pageYOffset - docElem.clientTop,
            left: box.left + win.pageXOffset - docElem.clientLeft
        };
    }

    function convertStyle(obj) {
        var style = "";

        for (var a in obj) {
            if (obj.hasOwnProperty(a)) {
                style += a + ":" + obj[a] + ";";
            }
        }

        return style;
    }

    var Effect = {

        // Effect delay
        duration: 750,

        show: function show(e, element) {

            // Disable right click
            if (e.button === 2) {
                return false;
            }

            var el = element || this;

            // Create ripple
            var ripple = document.createElement("div");
            ripple.className = "waves-ripple";
            el.appendChild(ripple);

            // Get click coordinate and element witdh
            var pos = offset(el);
            var relativeY = e.pageY - pos.top;
            var relativeX = e.pageX - pos.left;
            var scale = "scale(" + el.clientWidth / 100 * 3 + ")";

            // Support for touch devices
            if ("touches" in e) {
                relativeY = e.touches[0].pageY - pos.top;
                relativeX = e.touches[0].pageX - pos.left;
            }

            // Attach data to element
            ripple.setAttribute("data-hold", Date.now());
            ripple.setAttribute("data-scale", scale);
            ripple.setAttribute("data-x", relativeX);
            ripple.setAttribute("data-y", relativeY);

            // Set ripple position
            var rippleStyle = {
                top: relativeY + "px",
                left: relativeX + "px"
            };

            ripple.className = ripple.className + " waves-notransition";
            ripple.setAttribute("style", convertStyle(rippleStyle));
            ripple.className = ripple.className.replace("waves-notransition", "");

            // Scale the ripple
            rippleStyle["-webkit-transform"] = scale;
            rippleStyle["-moz-transform"] = scale;
            rippleStyle["-ms-transform"] = scale;
            rippleStyle["-o-transform"] = scale;
            rippleStyle.transform = scale;
            rippleStyle.opacity = "1";

            rippleStyle["-webkit-transition-duration"] = Effect.duration + "ms";
            rippleStyle["-moz-transition-duration"] = Effect.duration + "ms";
            rippleStyle["-o-transition-duration"] = Effect.duration + "ms";
            rippleStyle["transition-duration"] = Effect.duration + "ms";

            ripple.setAttribute("style", convertStyle(rippleStyle));
        },

        hide: function hide(e) {
            TouchHandler.touchup(e);

            var el = this;
            var width = el.clientWidth * 1.4;

            // Get first ripple
            var ripple = null;
            var ripples = el.getElementsByClassName("waves-ripple");
            if (ripples.length > 0) {
                ripple = ripples[ripples.length - 1];
            } else {
                return false;
            }

            var relativeX = ripple.getAttribute("data-x");
            var relativeY = ripple.getAttribute("data-y");
            var scale = ripple.getAttribute("data-scale");

            // Get delay beetween mousedown and mouse leave
            var diff = Date.now() - Number(ripple.getAttribute("data-hold"));
            var delay = 350 - diff;

            if (delay < 0) {
                delay = 0;
            }

            // Fade out ripple after delay
            setTimeout(function () {
                var style = {
                    top: relativeY + "px",
                    left: relativeX + "px",
                    opacity: "0",

                    // Duration
                    "-webkit-transition-duration": Effect.duration + "ms",
                    "-moz-transition-duration": Effect.duration + "ms",
                    "-o-transition-duration": Effect.duration + "ms",
                    "transition-duration": Effect.duration + "ms",
                    "-webkit-transform": scale,
                    "-moz-transform": scale,
                    "-ms-transform": scale,
                    "-o-transform": scale,
                    transform: scale };

                ripple.setAttribute("style", convertStyle(style));

                setTimeout(function () {
                    try {
                        el.removeChild(ripple);
                    } catch (e) {
                        return false;
                    }
                }, Effect.duration);
            }, delay);
        },

        // Little hack to make <input> can perform waves effect
        wrapInput: function wrapInput(elements) {
            for (var a = 0; a < elements.length; a++) {
                var el = elements[a];

                if (el.tagName.toLowerCase() === "input") {
                    var parent = el.parentNode;

                    // If input already have parent just pass through
                    if (parent.tagName.toLowerCase() === "i" && parent.className.indexOf("waves-effect") !== -1) {
                        continue;
                    }

                    // Put element class and style to the specified parent
                    var wrapper = document.createElement("i");
                    wrapper.className = el.className + " waves-input-wrapper";

                    var elementStyle = el.getAttribute("style");

                    if (!elementStyle) {
                        elementStyle = "";
                    }

                    wrapper.setAttribute("style", elementStyle);

                    el.className = "waves-button-input";
                    el.removeAttribute("style");

                    // Put element as child
                    parent.replaceChild(wrapper, el);
                    wrapper.appendChild(el);
                }
            }
        }
    };

    /**
     * Disable mousedown event for 500ms during and after touch
     */
    var TouchHandler = {
        /* uses an integer rather than bool so there's no issues with
         * needing to clear timeouts if another touch event occurred
         * within the 500ms. Cannot mouseup between touchstart and
         * touchend, nor in the 500ms after touchend. */
        touches: 0,
        allowEvent: function allowEvent(e) {
            var allow = true;

            if (e.type === "touchstart") {
                TouchHandler.touches += 1; //push
            } else if (e.type === "touchend" || e.type === "touchcancel") {
                setTimeout(function () {
                    if (TouchHandler.touches > 0) {
                        TouchHandler.touches -= 1; //pop after 500ms
                    }
                }, 500);
            } else if (e.type === "mousedown" && TouchHandler.touches > 0) {
                allow = false;
            }

            return allow;
        },
        touchup: function touchup(e) {
            TouchHandler.allowEvent(e);
        }
    };

    /**
     * Delegated click handler for .waves-effect element.
     * returns null when .waves-effect element not in "click tree"
     */
    function getWavesEffectElement(e) {
        if (TouchHandler.allowEvent(e) === false) {
            return null;
        }

        var element = null;
        var target = e.target || e.srcElement;

        while (target.parentElement !== null) {
            if (!(target instanceof SVGElement) && target.className.indexOf("waves-effect") !== -1) {
                element = target;
                break;
            } else if (target.classList.contains("waves-effect")) {
                element = target;
                break;
            }
            target = target.parentElement;
        }

        return element;
    }

    /**
     * Bubble the click and show effect if .waves-effect elem was found
     */
    function showEffect(e) {
        var element = getWavesEffectElement(e);

        if (element !== null) {
            Effect.show(e, element);

            if ("ontouchstart" in window) {
                element.addEventListener("touchend", Effect.hide, false);
                element.addEventListener("touchcancel", Effect.hide, false);
            }

            element.addEventListener("mouseup", Effect.hide, false);
            element.addEventListener("mouseleave", Effect.hide, false);
        }
    }

    Waves.displayEffect = function (options) {
        options = options || {};

        if ("duration" in options) {
            Effect.duration = options.duration;
        }

        //Wrap input inside <i> tag
        Effect.wrapInput($$(".waves-effect"));

        if ("ontouchstart" in window) {
            document.body.addEventListener("touchstart", showEffect, false);
        }

        document.body.addEventListener("mousedown", showEffect, false);
    };

    /**
     * Attach Waves to an input element (or any element which doesn't
     * bubble mouseup/mousedown events).
     *   Intended to be used with dynamically loaded forms/inputs, or
     * where the user doesn't want a delegated click handler.
     */
    Waves.attach = function (element) {
        //FUTURE: automatically add waves classes and allow users
        // to specify them with an options param? Eg. light/classic/button
        if (element.tagName.toLowerCase() === "input") {
            Effect.wrapInput([element]);
            element = element.parentElement;
        }

        if ("ontouchstart" in window) {
            element.addEventListener("touchstart", showEffect, false);
        }

        element.addEventListener("mousedown", showEffect, false);
    };

    window.Waves = Waves;
})(window);

},{}],16:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var React = _interopRequire(require("react"));

var _reactRouter = require("react-router");

var Route = _reactRouter.Route;
var RouteHandler = _reactRouter.RouteHandler;
var DefaultRoute = _reactRouter.DefaultRoute;
var State = _reactRouter.State;
var Link = _reactRouter.Link;
var Redirect = _reactRouter.Redirect;

var AppHandler = _interopRequire(require("./handlers/AppHandler.jsx"));

var SearchHandler = _interopRequire(require("./handlers/SearchHandler.jsx"));

var RepoHandler = _interopRequire(require("./handlers/RepoHandler.jsx"));

var routes = React.createElement(
  Route,
  { handler: AppHandler },
  React.createElement(Redirect, { from: "/", to: "search", params: { query: "javascript" } }),
  React.createElement(Route, { name: "search", path: "/search/?:query?", handler: SearchHandler }),
  React.createElement(Route, { name: "repo", path: "/repos/:owner/:repo", handler: RepoHandler })
);

module.exports = routes;

},{"./handlers/AppHandler.jsx":11,"./handlers/RepoHandler.jsx":12,"./handlers/SearchHandler.jsx":13,"react":"react","react-router":"react-router"}],17:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _superagent = require("superagent");

var Request = _superagent.Request;

var request = _interopRequire(_superagent);

Request.prototype.exec = function () {
  var req = this;

  return new Promise(function (resolve, reject) {
    req.end(function (error, res) {
      if (error) return reject(error);
      resolve(res);
    });
  });
};

module.exports = request;

},{"superagent":"superagent"}],18:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var _flummox = require("flummox");

var Flummox = _flummox.Flummox;
var Actions = _flummox.Actions;
var Store = _flummox.Store;

var LRU = _interopRequire(require("lru-cache"));

var AppStore = (function (Store) {
  function AppStore(flux) {
    _classCallCheck(this, AppStore);

    _get(Object.getPrototypeOf(AppStore.prototype), "constructor", this).call(this);

    var appActionIds = flux.getActionIds("appActions");
    this.register(appActionIds.searchItems, this.handleSearchItems);
    this.register(appActionIds.getItemDetails, this.handleGetItemDetails);

    this._searchItemsLRU = LRU(20);
    this._itemsDetailsLRU = LRU(20);

    this.state = {};
  }

  _inherits(AppStore, Store);

  _prototypeProperties(AppStore, null, {
    handleSearchItems: {
      value: function handleSearchItems(queryAndItems) {
        this._searchItemsLRU.set(queryAndItems.query, queryAndItems);
        this.emit("change");
      },
      writable: true,
      configurable: true
    },
    handleGetItemDetails: {
      value: function handleGetItemDetails(itemDetails) {
        this._itemsDetailsLRU.set(itemDetails.repoFullName, itemDetails);
        this.emit("change");
      },
      writable: true,
      configurable: true
    },
    getSearchItems: {
      value: function getSearchItems(query) {

        var res;
        if (this._searchItemsLRU.has(query)) {
          res = this._searchItemsLRU.get(query);
          res.store_miss = false;
        } else {
          res = { query: query, store_miss: true };
        }
        return res;
      },
      writable: true,
      configurable: true
    },
    getItemDetails: {
      value: function getItemDetails(ownerName, repoName) {

        var repoFullName = ownerName + "/" + repoName;
        var res;
        if (this._itemsDetailsLRU.has(repoFullName)) {
          res = this._itemsDetailsLRU.get(repoFullName);
          res.store_miss = false;
        } else {
          res = { repoFullName: repoFullName, store_miss: true };
        }
        return res;
      },
      writable: true,
      configurable: true
    }
  });

  return AppStore;
})(Store);

module.exports = AppStore;

},{"flummox":"flummox","lru-cache":"lru-cache"}],19:[function(require,module,exports){
"use strict";

Array.prototype.flatMap = function (lambda) {
	return Array.prototype.concat.apply([], this.map(lambda));
};

},{}],20:[function(require,module,exports){
"use strict";

/*jshint -W018, -W040, -W064, -W083, -W086 */

exports.performRouteHandlerStaticMethod = performRouteHandlerStaticMethod;
exports.debounce = debounce;

function performRouteHandlerStaticMethod(routes, methodName) {
  for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    args[_key - 2] = arguments[_key];
  }

  return regeneratorRuntime.async(function performRouteHandlerStaticMethod$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        return context$1$0.abrupt("return", Promise.all(routes.map(function (route) {
          return route.handler[methodName];
        }).filter(function (method) {
          return typeof method === "function";
        }).map(function (method) {
          return method.apply(undefined, args);
        })));

      case 1:
      case "end":
        return context$1$0.stop();
    }
  }, null, this);
}

function debounce(func, wait, immediate) {
  var timeout;
  return function () {
    var context = this,
        args = arguments;
    var later = function later() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

var delay = exports.delay = function (time) {
  return new Promise(function (resolve) {
    return setTimeout(resolve, time);
  });
};
Object.defineProperty(exports, "__esModule", {
  value: true
});

},{}],"apps":[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var firstapp = _interopRequire(require("./firstapp/index.jsx"));

exports.firstapp = firstapp;
Object.defineProperty(exports, "__esModule", {
    value: true
});

},{"./firstapp/index.jsx":14}]},{},[])


//# sourceMappingURL=apps.js.map