var bodyParser = require('body-parser')

var express = require('express');

require('./lib.js');
var apps = reqwire('apps');

var app = express();

app.get('/', apps.firstapp);
app.use(express.static('./dest'));

app.listen(8080);