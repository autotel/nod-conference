var Binder = require('./Binder');

const settings=require('../settings.js');
var path = require('path');
'use strict';
var serverSettings=settings.clientServer;
if(serverSettings.verbose) console.log("Settings:",settings);
var httpPort=serverSettings.port;

var express = require('express');
var app = express();
var os=require('os');
var fs=require('fs');


var privateKey  = fs.readFileSync(serverSettings.keyFile, 'utf8');
var certificate = fs.readFileSync(serverSettings.certificateFile, 'utf8');
var credentials = {key: privateKey, cert: certificate};

var httpsServer;
var sockets;

if(serverSettings.use){
  
  httpsServer = require('https').Server(credentials,app);
  sockets = require('socket.io')(httpsServer);
  
  console.log("starting peripheral server");
  
  app.get('/', function (req, res) {
    var clientPath = path.join(__dirname, "../client");
    if (serverSettings.verbose)console.log(__dirname);
    app.use(express.static(clientPath));
    res.sendFile(clientPath);
  });
  httpsServer.listen(httpPort, function(){
    console.log('listening on :'+httpPort);
  });

}


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

var clientServer=new(function(){
  if(sockets){
    sockets.on('connection', function(socket){
      var tracker=new Binder();
      tracker.update({name:"unnamed"});
      socket.on('oscillation', function (data) {
        if(serverSettings.verbose) console.log('  >>oscillation',data);
        data.unique=tracker.unique;
        sockets.emit('oscillation',data);
      });
      socket.on('update', function (data) {
        if(serverSettings.verbose) console.log('<<update', data);
        tracker.update(data);
      });
      socket.on('disconnect', function (data) {
        if(serverSettings.verbose) console.log('<<disconnect', data);
        Binder.remove(tracker);
      });
      socket.on('staterequest',function(){
        if(serverSettings.verbose) console.log("view state request");
        Binder.each(function(binder,index){
          if(serverSettings.verbose) console.log("  >>login data:",binder.data());
          socket.emit('update',binder.data());
        });
      });
      // setInterval(function(){socket.emit('update',{mm:77})},200);
      tracker.on('update', function (data) {
        if(serverSettings.verbose) console.log("  >>update", data);
        sockets.emit('update', data);
      }); 
      tracker.on('remove', function (data) {
        if(serverSettings.verbose) console.log("  >>remove", data);
        sockets.emit('remove', data);
      });
    });
  }else{
    console.log("no peripheral server support");
  }
  this.broadcast=function(a,b){
    if(serverSettings.verbose) console.log("BROADCAST");
    sockets.emit(a,b)
  };

  return this;
})();
module.exports=clientServer;
