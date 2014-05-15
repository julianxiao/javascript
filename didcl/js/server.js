var UDPCOMMAND = 3;
var VERSION = 1;
var CHOICE_MASK = 3;
var BRIGHTNESS = 255;

var dgram = require("dgram");
var Buffer = require('buffer').Buffer;
var dgram = require('dgram');

var message = new Buffer(5);
message[0]= VERSION;
message[1]= UDPCOMMAND;
message[2]= CHOICE_MASK;
message[3]= CHOICE_MASK;
message[4]= BRIGHTNESS;

var client = dgram.createSocket("udp4");

var sensor_timeout = 0; //for occupancy sensing

var query_emitter = new(require('events').EventEmitter);  

client.on("message", function (msg, rinfo) {
	console.log("received message");
	var bytes = [];
	bytes = msg;
	var headerIndex = 10;
	
		sys.puts(msg[8]);

		sys.puts(msg[9]);
		sys.puts(msg[10]);

		sys.puts(msg[11]);
		sys.puts(msg[12]);
		sys.puts(msg[13]);
		sys.puts(msg[14]);
		sys.puts(msg[15]);
	
		var t1 = bytes[headerIndex + 1];
		var t2 = bytes[headerIndex + 2];
		var temperature =  parseInt(t1, 16) + parseInt(t2, 16)*0.25;
		
/*		var diagnostic = bytes[headerIndex + 3];
		var diagnosticText = '';
		if (diagnostic == 0) diagnosticText = "Normal."
		else
		{
			diagnosticText = "Error code: " + diagnostic.toString(16).toUpperCase() + "<br><br>";
		}
		if (diagnostic & 1)
		{
			diagnosticText += "Output fail.<br>";
		}
		if (diagnostic & 2)
		{
			diagnosticText += "Over temperature protection.<br>";
		}
		if (diagnostic & 4)
		{
			diagnosticText += "Temperature alarm.<br>";
		}
		if (diagnostic & 8)
		{
			diagnosticText += "Fan fail.<br>";
		}
		if (diagnostic & 16)
		{
			diagnosticText += "AC Input Fail.<br>";
		}
		*/
		
		var temperatureAlarm = bytes[headerIndex + 3];
		if(temperatureAlarm == 1) temperatureAlarm = "Temperature Alert";
		else temperatureAlarm = "Normal";
			
		var dcAlarm = bytes[headerIndex + 4];
		if(dcAlarm == 0) dcAlarm = "<em>Alarm!</em>";
		else dcAlarm = "Normal";
		var acAlarm = bytes[headerIndex + 5];
		if(acAlarm == 1) acAlarm = "<em>Alarm!</em>";
		else acAlarm = "Normal";
		
		
/*		
		var voltage = bytes[headerIndex + 4].toString(16) + bytes[headerIndex + 5].toString(16) + bytes[headerIndex + 6].toString(16) + bytes[headerIndex + 7].toString(16);
		voltage = voltage.toUpperCase(); */
		var queryResults={
    		"temperature":temperature,
    		//"diagnostic": diagnosticText,
    		//"voltage": voltage,
    		"temperatureAlarm":temperatureAlarm,
    		"dcAlarm": dcAlarm,
    		"acAlarm": acAlarm,
    	};
		
	 	query_emitter.emit("queryResults", queryResults);  

}); 

client.on("listening", function () {
	var address = client.address();
	console.log("server listening " +
	address.address + ":" + address.port);
}); 


client.bind(12344); 

function sendTestPacket()
{
	client.send(message, 0, message.length, 8888, "192.168.1.160", function(err, bytes) {
		sys.puts("message content:");
		sys.puts(message[0]);
		sys.puts(message[1]);
		sys.puts(message[2]);
		sys.puts(message[3]);
		sys.puts(message[4]);
		if(err !=null)
		{
			sys.puts("UDP send error:" + err);  
  			client.close();
		}		
	});
}

var sys = require("sys"),  
    http = require("http"),  
    url = require("url"),  
    path = require("path"),  
    fs = require("fs"),  
    events = require("events");  

function load_static_file(uri, response) {  
    var filename = path.join(process.cwd(), uri);  
    fs.exists(filename, function(exists) {  
        if(!exists) {  
  	     	response.statusCode = 404;
			response.setHeader("Content-Type", "text/html");    
            response.write("404 Not Found\n");  
            response.end();  
            return;  
        }  
        fs.readFile(filename, "binary", function(err, file) {  
            if(err) {  
					response.statusCode = 500;
					response.setHeader("Content-Type", "text/html");    
					response.write(err + "\n");  
          			response.end();  
                return;  
            } 
           
           	response.statusCode = 200;
 			response.write(file, "binary");  
            response.end();  
        });  
    });  
}  

http.createServer(function(request, response) {  
    var uri = url.parse(request.url).pathname;  
    if(uri === "/v1/lights") {  
    	var parts = url.parse(request.url, true);
    	message[1] = 0;
    	message[2] = 0;
    	var mask = parts.query.mask;
    	message[3] = mask;
    	message[4] = parts.query.brightness;
     	sys.puts("sending dim light command ...");  
     	if (mask >= 256)
     	{
     		message[3] = mask - 256;
     		message[2] = 1;
     	}
     	
    	sendTestPacket();
    	
    	response.write('<html><body><h1>dim lights</h1></body></html>');
        response.end();
    }
    
    else   if(uri === "/v1/fans") {  
    	var parts = url.parse(request.url, true);
    	message[1] = 3;
    	message[2] = 0;
    	var mask = parts.query.mask;
    	message[3] = mask;
    	message[4] = parts.query.speed;
     	sys.puts("sending fan speed command ...");  
    	sendTestPacket();
    	
    	response.write('<html><body><h1>Set fan speed</h1></body></html>');
        response.end();
    }

    else if(uri === "/v1/group")
    {
    	var parts = url.parse(request.url, true);
    	message[1] = 1;
    	message[2] = parts.query.param1;
    	message[3] = 0;
    	message[4] = parts.query.param2;
    	
     	sys.puts("sending group light demo command ...");  
    	sendTestPacket();
        response.write('<html><body><h1>group light demo</h1></body></html>');
        response.end();
    }
    else if(uri === "/v1/occupancy")
    {
    	var parts = url.parse(request.url, true);
    	if(parts.query.status === "on")
    	{
    		if(sensor_timeout !=0)
    		{
    		message[1] = 0;
    		message[2] = 1;
    		message[3] = 255;
    		message[4] = 255;
    		sendTestPacket();
			console.log("occupant: lights on");
			}
    		
    	}
    	if(parts.query.status === "off")
    	{
    		if(sensor_timeout !=0)
    		{
    		message[1] = 0;
    		message[2] = 1;
    		message[3] = 255;
    		message[4] = 25;
    		setTimeout(sendTestPacket, sensor_timeout*1000); 
    		console.log("lights off in ", sensor_timeout, " seconds");
    		}
    	
    	}
    	response.write('<html><body><h1>occupancy events</h1></body></html>');
        response.end();
    }
    else if(uri === "/v1/settings")
    {
    	var parts = url.parse(request.url, true);
    	sensor_timeout =  parts.query.timeout;
    	console.log("time out: ", sensor_timeout);
    	response.write('<html><body><h1>timeout settings</h1></body></html>');
        response.end();
    	
    }
    else if(uri === "/v1/query")
    {
 		   	console.log("query light engine: ");
    		
    		message[1] = 2;
    		message[2] = 0;
    		message[3] = 0;
    		message[4] = 0;
    		sendTestPacket();
    		
    	
       		var listener = query_emitter.addListener("queryResults", function(queryResults) {  
        
            response.writeHead(200, { "Content-Type" : "application/json" });  

            var data = {"status": "success"};
            response.write(JSON.stringify(queryResults));  
            response.end();  
            console.log("query success");
            console.log(JSON.stringify(queryResults));
  
            clearTimeout(timeout);  
        });  
          
        var timeout = setTimeout(function() {  
        
       		response.writeHead(408, { "Content-Type" : "application/json" });  
   //    		var data = {"temperature": "200F"};
  //          response.write(JSON.stringify(data));  

            response.end();  
            console.log('Query failed to retrieve data before time-out!');
 
            query_emitter.removeAllListeners();  
        }, 9000);  
    	
    }
   
    else {  
        load_static_file(uri, response);  
    }  
}).listen(8080);  

sys.puts("Server running at http://localhost:8080/");  