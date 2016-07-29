var express = require('express'),
	app = express();

var port = process.env.PORT || 8000; //for Heroku

var io = require('socket.io').listen(app.listen(port));

require('./config')(app, io);
require('./routes')(app, io);

console.log('Application is running on http://localhost:' + port);
