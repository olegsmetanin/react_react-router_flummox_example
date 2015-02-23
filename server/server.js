var bodyParser = require('body-parser')

var express = require('express');

var app = express();

var firstapp = require('./../src/assets/js/apps/firstapp/server.jsx');

app.get('/', firstapp);

app.use(express.static('./dest'));

app.listen(8080);