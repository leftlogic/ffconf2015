var express = require('express');
var compression = require('compression');
var app = express();


app.use('/', express.static(__dirname + '/../public', { maxAge: 365 * 24 * 60 * 60 * 1000 }));
app.listen(process.env.PORT || 8000);