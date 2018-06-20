re-organization of the emoticon server
  this is to allow using phones instead of the i2c hardware in any network.
  the idea is that every client and detector connects to the same server.
  Later I can integrate the i2c reader, as an additional client that connects to the server. It can even unrequire electron

* the current server is not a client tracker. I should do a generic socket client tracker, I could use the same for all my projects since I almost always use the same data binding structure.
* https://localhost:8080/index.html is a logger
* https://localhost:8080/phone.html is to track with the phone
* https://localhost:8080/view.html is to watch the different phone's activities