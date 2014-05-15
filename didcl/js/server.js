var dgram = require('dgram'),
    Buffer = require('buffer').Buffer,
    dgram = require('dgram');


var message = new Buffer(5),
    client = dgram.createSocket('udp4'),
    sensor_timeout = 0,
    query_emitter = new(require('events').EventEmitter);

client.on('message', function (msg, rinfo) {
    var bytes = [],
        headerIndex = 10;

    bytes = msg;
    
    var t1 = bytes[headerIndex + 1],
        t2 = bytes[headerIndex + 2],
        temperature = parseInt(t1, 16) + parseInt(t2, 16) * 0.25,
        temperatureAlarm = bytes[headerIndex + 3],
        dcAlarm = bytes[headerIndex + 4],
        acAlarm = bytes[headerIndex + 5];


    if (temperatureAlarm == 1) temperatureAlarm = 'Temperature Alert';
    else temperatureAlarm = 'Normal';

    if (dcAlarm == 0) dcAlarm = '<em>Alarm!</em>';
    else dcAlarm = 'Normal';
    if (acAlarm == 1) acAlarm = '<em>Alarm!</em>';
    else acAlarm = 'Normal';

    var queryResults = {
        'temperature': temperature,
        'temperatureAlarm': temperatureAlarm,
        'dcAlarm': dcAlarm,
        'acAlarm': acAlarm,
    };

    query_emitter.emit('queryResults', queryResults);

});

client.on('listening', function () {
    var address = client.address();
    console.log('server listening ' + address.address + ':' + address.port);
});


client.bind(12344);

function sendTestPacket() {
    client.send(message, 0, message.length, 8888, '192.168.1.160', function (err, bytes) {
        if (err != null) {
            sys.puts('UDP send error:' + err);
            client.close();
        }
    });
}


var sys = require('sys'),
    http = require('http'),
    url = require('url'),
    path = require('path'),
    fs = require('fs'),
    events = require('events');

function load_static_file(uri, response) {
    var filename = path.join(process.cwd(), uri);
    fs.exists(filename, function (exists) {
        if (!exists) {
            response.statusCode = 404;
            response.setHeader('Content-Type', 'text/html');
            response.write('404 Not Found\n');
            response.end();
            return;
        }
        fs.readFile(filename, 'binary', function (err, file) {
            if (err) {
                response.statusCode = 500;
                response.setHeader('Content-Type', 'text/html');
                response.write(err + '\n');
                response.end();
                return;
            }

            response.statusCode = 200;
            response.write(file, 'binary');
            response.end();
        });
    });
}

http.createServer(function (request, response) {
    var uri = url.parse(request.url).pathname;

    switch (uri) {

    case '/v1/lights':
        var parts = url.parse(request.url, true),
            mask = parts.query.mask,
            brightness = parts.query.brightness;
        message = [0, 0, 0, mask, brightness];
        sys.puts('sending dim light command ...');
        if (mask >= 256) {
            message[3] = mask - 256;
            message[2] = 1;
        }

        sendTestPacket();

        response.write('<html><body><h1>dim lights</h1></body></html>');
        response.end();
        break;

    case '/v1/fans':
        var parts = url.parse(request.url, true),
            mask = parts.query.mask,
            speed = parts.query.speed;

        message = [0, 3, 0, mask, speed];
        sys.puts('sending fan speed command ...');
        sendTestPacket();
        response.write('<html><body><h1>Set fan speed</h1></body></html>');
        response.end();
        break;

    case '/v1/group':

        var parts = url.parse(request.url, true),
            param1 = parts.query.param1,
            param2 = parts.query.param2;
        message = [0, 1, param1, 0, param2];
        sys.puts('sending group light demo command ...');
        sendTestPacket();
        response.write('<html><body><h1>group light demo</h1></body></html>');
        response.end();
        break;

    case '/v1/occupancy':

        var parts = url.parse(request.url, true);
        if (parts.query.status === 'on') {
            if (sensor_timeout != 0) {
                message = [0, 0, 1, 255, 255];
                sendTestPacket();
                console.log('occupant: lights on');
            }

        }
        if (parts.query.status === 'off') {
            if (sensor_timeout != 0) {
                message = [0, 0, 1, 255, 25];
                setTimeout(sendTestPacket, sensor_timeout * 1000);
                console.log('lights off in ', sensor_timeout, ' seconds');
            }

        }
        response.write('<html><body><h1>occupancy events</h1></body></html>');
        response.end();
        break;

    case '/v1/settings':
        var parts = url.parse(request.url, true);
        sensor_timeout = parts.query.timeout;
        console.log('time out: ', sensor_timeout);
        response.write('<html><body><h1>timeout settings</h1></body></html>');
        response.end();
        break;
        
    case '/v1/query':

        message = [0, 2, 0, 0, 0];
        sendTestPacket();

        var listener = query_emitter.addListener('queryResults', function (queryResults) {

            response.writeHead(200, {
                'Content-Type': 'application/json'
            });

            var data = {
                'status': 'success'
            };
            response.write(JSON.stringify(queryResults));
            response.end();

            clearTimeout(timeout);
        });

        var timeout = setTimeout(function () {

            response.writeHead(408, {
                'Content-Type': 'application/json'
            });

            response.end();
            console.log('Query failed to retrieve data before time-out!');

            query_emitter.removeAllListeners();
        }, 9000);

        break;

    default:
        load_static_file(uri, response);
        
    }
}).listen(8080);