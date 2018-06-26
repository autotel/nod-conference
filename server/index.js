var Binder = require('./Binder');

const settings=require('../settings.js');
// const SocketClientMan=require('./SocketClientMan.js');
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


console.info('view: https://' + ip + ':' + httpPort + '/phone.html . ');
console.info('phone: https://'+ip+':'+httpPort+'/view.html . ');

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
  if(sockets){
    sockets.on('connection', function(socket){
      var tracker=new Binder();
      tracker.update({name:"unnamed"});
      socket.on('oscillation', function (data) {
        console.log('  >>oscillation',data);
        data.unique=tracker.unique;
        sockets.emit('oscillation',data);
      });
      socket.on('update', function (data) {
        console.log('<<update', data);
        tracker.update(data);
      });
      socket.on('disconnect', function (data) {
        console.log('<<disconnect', data);
        Binder.remove(tracker);
      });
      socket.on('staterequest',function(){
        console.log("view state request");
        Binder.each(function(binder,index){
          console.log("  >>login data:",binder.data());
          socket.emit('update',binder.data());
        });
      });
      // setInterval(function(){socket.emit('update',{mm:77})},200);
      tracker.on('update', function (data) {
        console.log("  >>update", data);
        sockets.emit('update', data);
      }); 
      tracker.on('remove', function (data) {
        console.log("  >>remove", data);
        sockets.emit('remove', data);
      });
    });
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
