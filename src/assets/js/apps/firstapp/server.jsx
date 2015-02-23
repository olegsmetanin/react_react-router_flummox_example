'use strict';
import React from 'react';
import Router from 'react-router';
import { routes, Flux, performRouteHandlerStaticMethod } from './components.jsx'

export default function (req, res) {

  let flux = new Flux();

  Router.run(routes, req.url, function (Handler, state) {
    

    async function run() {

      await performRouteHandlerStaticMethod(state.routes, 'routerWillRun', state, flux);

      React.withContext(
        { flux },
        () => {
          let content = React.renderToString(<Handler />);
          res
            .set('Content-Type', 'text/html')
            .status(200)
            .send(`<!DOCTYPE html>
            <html lang="en">
              <head>
                <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=no"/>
                <title>Simple example of react + react-router + flummox</title>
              </head>
              <body>
                <div id="app">
                ${ content }
                </div>
                <!--  Scripts-->
                <script type="text/javascript" src="assets/js/lib.js"></script>
                <script type="text/javascript" src="assets/js/apps.js"></script>
                <script>
                require('apps').firstapp();
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
};