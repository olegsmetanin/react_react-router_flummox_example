'use strict';
/*jshint -W018, -W030, -W040, -W064, -W083, -W086 */

import React from 'react';
import Router from 'react-router';
import Flux from './Flux.js';
import routes from './routes.js';
import { performRouteHandlerStaticMethod } from './utils/Promise.js';
import 'babel/polyfill';

import DocumentTitle from 'react-document-title';

export default function (req, res) {

  let flux = new Flux();

  Router.run(routes, req.url, function (Handler, state) {

    async function run() {

      await performRouteHandlerStaticMethod(state.routes, 'routerWillRunOnServer', state, flux);

      React.withContext(
        { flux },
        () => {

          let content = React.renderToString(<Handler />);
          let title = DocumentTitle.rewind();

          res
            .set('Content-Type', 'text/html')
            .status(200)
            .send(`<!DOCTYPE html>
            <html lang="en">
              <head>
                <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=no"/>
                <title>${ title }</title>
                <link href="/assets/css/app.css" type="text/css" rel="stylesheet" media="screen,projection"/>
              </head>
              <body>
                <div id="app">
                ${ content }
                </div>
                <!--  Scripts-->
                <script type="text/javascript" src="/assets/js/lib.js"></script>
                <script type="text/javascript" src="/assets/js/apps.js"></script>
                <script>
                require('app')('app');
                </script>
              </body>
            </html>`)
            .end()
        }
        );
    }

    run().catch(error => {
      throw error;
    });

  });
}
