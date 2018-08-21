var settings={
  // electronClient:{
  //   socketServer: 'http://nod-conference.herokuapp.com',
  //   socketPort:80,
  // },
  clientServer:{
    useHttps:false,
    use:true,
    porthttps: process.env.PORT,
    porthttp: process.env.PORT,
    port: process.env.PORT,
    keyFile:'./server/sslcert/server.key',
    certificateFile:'./server/sslcert/server.crt',
    verbose:true
  }
}
module.exports=settings;
