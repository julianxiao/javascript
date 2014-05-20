// modules =================================================
var express = require('express');
var app     = express();


var mongoose= require('mongoose');
var db = require('./config/db');

mongoose.connect(db.url, function (err, res) {
  if (err) {
  console.log ('ERROR connecting to: ' + db.url + '. ' + err);
  } else {
  console.log ('Succeeded connected to: ' + db.url);
  }
}); 



app.configure(function() {
	app.use(express.static(__dirname + '/public')); 	// set the static files location /public/img will be /img for users
	app.use(express.logger('dev')); 					// log every request to the console
	app.use(express.bodyParser()); 						// pull information from html in POST
	app.use(express.methodOverride()); 					// simulate DELETE and PUT
});

// routes ==================================================
require('./app/routes')(app); // pass our application into our routes

var port = process.env.PORT || 8080; // set our port

// start app ===============================================
app.listen(port);	
console.log('Server start on port ' + port); 			
exports = module.exports = app; 						// expose app