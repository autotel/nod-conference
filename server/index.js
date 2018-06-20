
const settings=require('../settings.js');
const SocketClientMan=require('./SocketClientMan.js');
var path = require('path');
'use strict';
var onHandlers=require('onhandlers');

console.log("Settings:",settings);
var httpPort=settings.phoneDetectorServer.port;
var http = require('http')//.Server(app);

var express = require('express');
var app = express();
var os=require('os');
var fs=require('fs');


var privateKey  = fs.readFileSync(settings.phoneDetectorServer.keyFile, 'utf8');
var certificate = fs.readFileSync(settings.phoneDetectorServer.certificateFile, 'utf8');
var credentials = {key: privateKey, cert: certificate};

var httpsServer;
var sockets;
var socketClients;

if(settings.phoneDetectorServer.use){
  
  httpsServer = require('https').Server(credentials,app);
  sockets = require('socket.io')(httpsServer);
  
  console.log("starting peripheral server");
  
  app.get('/', function (req, res) {
    var clientPath = path.join(__dirname, "../client");
    console.log(__dirname);
    app.use(express.static(clientPath));
    // app.use("/shared",express.static('./shared'));
    res.sendFile(clientPath);
  });
  // app.get('sovellus/', function (req, res) {
  // });
  httpsServer.listen(httpPort, function(){
    console.log('listening on :'+httpPort);
  });

}
// var httpServer = http.createServer(app);
// var httpsServer = https.createServer(credentials, app);
// var httpServer= http.createServer(app);


var ifaces=os.networkInterfaces();
var ips = [];
for (var dev in ifaces) {
  var alias=0;
  ifaces[dev].forEach(function(details){
    if (details.family=='IPv4') {
      ips.push(details.address);
      ++alias;
    }
  });
}

var ip = ips.filter(function(d) {
  return d != '127.0.0.1';
})[0];


console.info('To connect, open your mobile web browser and go to '+ip+':'+httpPort+'. Make sure the computer and phone are connected to the same network');

console.log("starting server");
app.get('/', function(req, res){
  app.use("/",express.static('./phoneDetectorServer/client'));
  // res.send("hi");
  res.sendFile(__dirname + '/client/index.html');
});

// httpServer.listen(httpPort, function(){
//   console.log('http listening on :'+httpPort);
// });

httpsServer.listen(httpPort+1, function(){
  console.log('https listening on :'+(httpPort+1));
});


var streams = {
  'motion': {},
  'orientation': {}
};

var getStream = function (name, tp) {
  if (typeof streams[tp][name] !== 'undefined') {
    return streams[tp][name];
  } else {
    var stream = fs.createWriteStream(path.join('data',name+'-'+tp+'.txt'));
    streams[tp][name] = stream;
    return stream;
  }
};



var phoneDetectorServer=new(function(){



  var active=false;

  var serverMan=this;
  var self=this;

  onHandlers.call(this);
  if(sockets){
    socketClients=new SocketClientMan(this);
    sockets.on('connection', function(socket){
      var client=socketClients.add(socket);
      console.log("+ client (peripheral)")
      self.handle('+ client',client)


      socket.on('oscillation', function (data) {
        console.log('oscillation',data);
        self.handle("oscillation",data);
      });
      socket.on('gesture', function (data) {
        console.log('gesture',data);
        self.handle("gesture",data);
      });
    });
    active=true;
  }else{
    console.log("no peripheral server support");
  }
  this.broadcast=function(a,b){
    console.log("BROADCAST");
    sockets.emit(a,b)
  };

  return this;
})();
module.exports=phoneDetectorServer;
