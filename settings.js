var settings={
  electronClient:{
    // socketServer: 'http://192.168.11.3',
    // socketServer:'http://10.100.54.149',
    socketServer: "http://88.112.168.211",
    // socketServer:'http://autotel.ddns.net',
    socketPort:80,
  },
  clientServer:{
    use:true,
    porthttps: 8080,
    porthttp: 80,
    port:80,
    keyFile:'./server/sslcert/server.key',
    certificateFile:'./server/sslcert/server.crt',
    verbose:true
  }
}
module.exports=settings;
