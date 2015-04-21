'use strict';
/*jshint -W018, -W030, -W040, -W064, -W083, -W086 */

import React from 'react';
import Router from 'react-router';
import Flux from './Flux.js';
import routes from './routes.js';
import { performRouteHandlerStaticMethod } from './utils/Promise.js';
import 'babel/polyfill';

import './libs/waves.js';
import FastClick from 'fastclick';

window.Waves.displayEffect();
FastClick.attach(document.body);

export default function(divid) {

  let flux = new Flux();

  Router.run(routes, (Handler, state) => {

    async function run() {

      await performRouteHandlerStaticMethod(state.routes, 'routerWillRunOnClient', state, flux);

      React.withContext(
        { flux },
        () => React.render(<Handler />, document.getElementById(divid))
        );
    }

    run().catch(error => {
      throw error;
    });

  })


}