var Binder = require('./Binder');
const settings = require('../settings.js');
var serverSettings = settings.clientServer;

var express = require('express');
var app = express();
var http = require('http');
if (settings.useHttps)
    var https = require('https');
var fs = require('fs');
var EventEmitter = require('events').EventEmitter;
var ioServer = require('socket.io');
var os = require('os');
var path = require('path');


var startupItems = [];
startupItems.httpServerReady = false;
startupItems.httpsServerReady = false;

var ee = new EventEmitter();

ee.on('ready', function (arg) {
    startupItems[arg] = true;
    if (startupItems.httpServerReady && startupItems.httpsServerReady) {
        // setInterval(function cb() {
        //     var rnd = Math.random();
        //     console.log('emitting update: %d', rnd);
        //     io.emit('update', rnd);
        // }, 5000);
    };
});

app.get('/', function (req, res) {
    var clientPath = path.join(__dirname, "../client");
    if (serverSettings.verbose) console.log(clientPath);
    app.use(express.static(clientPath));
    res.sendFile(clientPath + "/view.html");
});
app.set('http_port', serverSettings.porthttp || 80);
app.set('https_port', serverSettings.porthttps || 443);

var httpServer = http.createServer(app);

var privateKey = fs.readFileSync(serverSettings.keyFile, 'utf8');
var certificate = fs.readFileSync(serverSettings.certificateFile, 'utf8');
var credentials = { key: privateKey, cert: certificate };

if (settings.useHttps)
    var httpsServer = https.createServer(credentials, app);

var io = new ioServer();

httpServer.listen(app.get('http_port'), function () {
    console.log('httpServer listening on port %d', app.get('https_port'));
    ee.emit('ready', 'httpServerReady');
});
if (settings.useHttps) {

    httpsServer.listen(app.get('https_port'), function () {
        console.log('httpsServer listening on port %d', app.get('https_port'));
        ee.emit('ready', 'httpsServerReady');
    });

    io.attach(httpsServer);
}
io.attach(httpServer);

io.on('connection', function (socket) {
    console.log('socket connected: %s', socket.id);
});


var ifaces = os.networkInterfaces();
var ips = [];
for (var dev in ifaces) {
    var alias = 0;
    ifaces[dev].forEach(function (details) {
        if (details.family == 'IPv4') {
            ips.push(details.address);
            ++alias;
        }
    });
}

var ip = ips.filter(function (d) {
    return d != '127.0.0.1';
})[0];

console.info('phone: https://' + ip + ':' + app.get('https_port') + '/phone.html . ');
console.info('view: http://' + ip + ':' + app.get('http_port') + '/view.html . ');
console.info('wakeup: http://' + ip + ':' + app.get('http_port') + ' . ');

var clientServer = new (function () {

    io.on('connection', function (socket) {
        var tracker = new Binder();
        tracker.update({ name: "unnamed" });
        socket.on('oscillation', function (data) {
            if (serverSettings.verbose) console.log('  >>oscillation', data);
            data.unique = tracker.unique;
            io.emit('oscillation', data);
        });
        socket.on('soundstatus', function (data) {
            if (serverSettings.verbose) console.log('  >>oscillation', data);
            data.unique = tracker.unique;
            io.emit('soundstatus', data);
        });
        socket.on('update', function (data) {
            if (serverSettings.verbose) console.log('<<update', data);
            tracker.update(data);
        });
        socket.on('disconnect', function (data) {
            if (serverSettings.verbose) console.log('<<disconnect', data);
            Binder.remove(tracker);
        });
        socket.on('staterequest', function () {
            if (serverSettings.verbose) console.log("view state request");
            Binder.each(function (binder, index) {
                if (serverSettings.verbose) console.log("  >>login data:", binder.data());
                socket.emit('update', binder.data());
            });
        });
        // setInterval(function(){socket.emit('update',{mm:77})},200);
        tracker.on('update', function (data) {
            if (serverSettings.verbose) console.log("  >>update", data);
            io.emit('update', data);
        });
        tracker.on('remove', function (data) {
            if (serverSettings.verbose) console.log("  >>remove", data);
            io.emit('remove', data);
        });
    });
    this.broadcast = function (a, b) {
        if (serverSettings.verbose) console.log("broadcast");
        io.emit(a, b)
    };

    return this;
})();
module.exports = clientServer;