var settings={
  electronClient:{
    socketServer:'http://192.168.11.3',
    socketPort:8081,
  },
  clientServer:{
    use:true,
    porthttps: 8080,
    porthttp: 8081,
    port:8081,
    keyFile:'./server/sslcert/server.key',
    certificateFile:'./server/sslcert/server.crt',
    verbose:true
  }
}
module.exports=settings;
