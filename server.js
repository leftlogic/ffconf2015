'use strict';
var harp = require('harp');
var server = require('harp-static');
var moment = require('moment');
var outputPath = __dirname + '/www';
var port = process.env.PORT || 9000;

global.idify = function (s) { return s.replace(/&.*?;/g, '').replace(/\s+/g, '-').replace(/[^\w\-]/g, '').toLowerCase(); };

// this line, although dirty, ensures that Harp templates
// have access to moment - which given the whole partial
// import hack doesn't work consistently across dynamic vs
// compiled, this is the cleanest solution.
global.moment = moment;

harp.compile(__dirname, outputPath, function (errors) {
  if (errors) {
    console.log(JSON.stringify(errors, null, 2));
    process.exit(1);
  }

  console.log('Running harp-static on ' + port);
  server(outputPath, port);
});