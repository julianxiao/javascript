var dgram = require("dgram");
var server = dgram.createSocket("udp4");
var Buffer = require('buffer').Buffer;

var status = 0; //for occupancy sensing

function stringToBytes ( str ) {
  var ch, st, re = [];
  for (var i = 0; i < str.length; i++ ) {
  console.log("length ", str.length);
    ch = str.charCodeAt(i);  // get char 
    st = [];                 // set up "stack"
    do {
      st.push( ch & 0xFF );  // push byte to stack
      ch = ch >> 8;          // shift value down by 1 byte
    }  
    while ( ch );
    // add stack contents to result
    // done because chars have "wrong" endianness
    re = re.concat( st.reverse() );
  }
  // return an array of bytes
  return re;
}

var UDPCOMMAND = 3;
var VERSION = 1;
var CHOICE_MASK = 3;
var BRIGHTNESS = 255;

var message = new Buffer(5);
message[0]= VERSION;
message[1]= UDPCOMMAND;
message[2]= CHOICE_MASK;
message[3]= CHOICE_MASK;
message[4]= BRIGHTNESS;

var client = dgram.createSocket("udp4");

function sendTestPacket()
{
	client.send(message, 0, message.length, 8886, "192.168.1.161", function(err, bytes) {
		console.log("message content:", message[0],message[1],message[2],message[3], message[4]);
		if(err !=null)
		{
			sys.puts("UDP send error:" + err);  
  			client.close();
		}		
	});
}

//setInterval(sendTestPacket, 3*1000); 

server.on("message", function (msg, rinfo) {
	var bytes = [];
	bytes = msg;
	var timestamp = new Date().toISOString();
//	console.log(timestamp + " Recieve bit from board: " + bytes[10] + " from " + rinfo.address + ":" + rinfo.port);
	if (bytes[10] != status)
	{
		var http = require('http');

		if (status ==0)
		{
			http.get("http://192.168.1.162:8080/v1/occupancy?status=on", function(res) {
 	 		console.log(timestamp + " occupancy detected");
			}).on('error', function(e) {
  			console.log("Got error: " + e.message);
			});
		
			status = 1;
		}
		else
		{
			http.get("http://192.168.1.162:8080/v1/occupancy?status=off", function(res) {
 	 		console.log(timestamp + " emptied");
			}).on('error', function(e) {
  			console.log("Got error: " + e.message);
			});

			status = 0;
	
		}
	}
});

server.on("listening", function () {
	var address = server.address();
	console.log("server listening " +
	address.address + ":" + address.port);
});

server.bind(12345);

