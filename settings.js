var settings={
  intercomServer:{
    //address:"http://localhost"
    // address:"http://192.168.100.14",
    port:8082
  },
  emoticonsServer:{
    port:8081
  },
  phoneDetectorServer:{
    use:true,
    port:8080,
    keyFile:'./server/sslcert/server.key',
    certificateFile:'./server/sslcert/server.crt',
  }
}
module.exports=settings;
