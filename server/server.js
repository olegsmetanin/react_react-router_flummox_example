var bodyParser = require('body-parser')

var express = require('express');

var app = express();

var firstapp = require('./../src/assets/js/apps/firstapp/server.jsx');

app.use('/assets', express.static('./dest/assets'));

app.use(firstapp);

app.listen(8080);