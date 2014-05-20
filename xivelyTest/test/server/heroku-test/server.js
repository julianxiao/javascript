var express = require("express");
var logfmt = require("logfmt");
var app = express();

var url = require( "url" );
var queryString = require( "querystring" );


var redis;

if (process.env.REDISTOGO_URL) {
    redis = require('redis-url').connect(process.env.REDISTOGO_URL);
    /*
    var rtg   = require("url").parse(process.env.REDISTOGO_URL);
    var redis = require("redis").createClient(rtg.port, rtg.hostname);

    redis.auth(rtg.auth.split(":")[1]); */
    
}
else {
    redis = require('redis').createClient();
}

redis.on("error", function (err) {
        console.log("Redis error " + err);
}); 


var mongo = require('mongodb');

var mongoUri = process.env.MONGOLAB_URI ||
  process.env.MONGOHQ_URL ||
  'mongodb://localhost/mydb';

mongo.Db.connect(mongoUri, function (err, db) {
  db.collection('mydocs', function(er, collection) {
    collection.insert({'mykey': 'myvalue'}, {safe: true}, function(er,rs) {
    });
  });
});

app.use(logfmt.requestLogger());

app.get('/foo', function(req, res) {

        // parses the request url
        var theUrl = url.parse( req.url );

        // gets the query part of the URL and parses it creating an object
        var queryObj = queryString.parse( theUrl.query );

        // queryObj will contain the data of the query as an object
        // and jsonData will be a property of it
        // so, using JSON.parse will parse the jsonData to create an object
       // var obj = JSON.parse( queryObj.jsonData );

        // as the object is created, the live below will print "bar"
        console.log( JSON.parse(queryObj.data));
        
             
  res.jsonp(JSON.parse(queryObj.data));
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});

