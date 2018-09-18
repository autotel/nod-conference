# File structure

description of the use for each file in the repository.

* client: contains different clients meant to be visited by browser using laptop or phone.
  * libs: javascript external libs, to be loaded using normal http.
  * res: graphics and other resources for the clients.
  * websound: contains the client for the sound analyser (work in progress).
    * index.html: main client.
    * main.css: styles for webaudio client.
    * main.js: compiled sound analysis script. The SRC of that script is on a different repository: https://github.com/autotel/webSoundAnalyzer
  * index.html: contains a small socket test. Currently it is not used.
  * phone-recognizer.js: compiled code for the phone client. 
    * The source of this code is located at /src/recognizer
    * it can be rebuilt by running `npm run recognizer-dev` or `npm run recognizer-build` at the root of the project.
    * It is designed to take gyroscope data and convert it to gestures by detecting oscillations.
  * phone-renderer.js: makes a visualization of variables (in this case, the phone gyroscope, but any other numeric variables can be added)
  * phoneapp.css: styles for the phone client
  * view-EmoticonsREnderer.js: manages the rendering, appearance and disappearance of the emoticons in the view client.
  * view.html: Main view client. Where the emoticons appear.
* client-electron: container for the electron-based desktop app.
  * client: contains javascript code. These are copies of the ones contained in the `/client ` folder. This copies are so that Electron can find the files.
    * libs: contains external js libs
    * phone-recognizer.js: the same as /client/phone-recognizer.js
    * phone-renderer.js: almost the same as /client/phone-renderer.js
  * clusterizer.js: a code used to visualize gestures using two coordinates. It is currently not used.
  * index.html: used as the index by the electron app. Refer to usage of Electron.
  * index.js: used as the backend of the electron app. Refer to usage of Electron.
  * SerialDevice.js: wrapper for serial objects (a manager for devices which are connected via serial)
  * serialDevices.js: finds all serial devices, and creates a SerialDevice object for each. It also maps each piece of data received to a variable such as `variables["orientation.x"]`
  * socket.io.js: socket.io library
  * Transceiver.js: module that converts serial communication into numbers. (for example, a four-byte float into int.) Not all the conversions might be working, it needs to be coordinated with the firmware on the headset.
* server
  * sslcert: contains self-signed (invalid) ssl certificate. To use a phone's accelerometer or gyroscope data, the url needs to be https; hence the need for an ssl. Being self-signed means that the user gets a security error on their browsers, which is ok for testing purposes.
  * Binder.js: a set of objects and functions that help to keep track the state of different clients. The use case is the following: if one enters into the view client (where the emoticons appear), the clients that logged in before would not appear: they need to be sent to the new client. This binder keeps track of all the clients and some data related to them, so that they are visible to anyone who logs in later.
  * index: main server, manages the socket connections and messages among all the clients (phone, electron, view, webaudio). It also serves the files (index.html, view.html, websound, phone.html)
* src: contains the source of compiled (transpiled) code
  * recognizer: src of recognizer: the functions that detect gesture events out of movement.
    * readme.md
    * recognizer.js: recognizes the gestures by using values. It is based on the detection of an oscillation within a frequency range. This is why it uses low pass and highpass operators. It reduces the amount of events using throttling.
    * throtling.js: closure to prevent a function from running too often, particularly the oscillation detection event.
* index.js:  it is there just so that you can start the server running `node index.js`

# installation of basic requirements

1. Install Node.js
   * Installers for all platforms available at https://nodejs.org/en/download/
   * Open a command window and make sure it is possible to run from it. 
     * run on the command line: `node -v`, It should display a number instead of an error
     * run on the command line: `npm -v` It should display a number instead of an error
2. Download the repository and install
   * Either download the repository as a file, or run "git clone". Go to https://bitbucket.org/autotel/nod-conference/src/master/
     * To download: Go to the "downloads" menu item in the menu at the left
     * To clone: use `git clone https://autotel@bitbucket.org/autotel/nod-conference.git`
   * Unzip it in the desired location

# headset transceiver

Headset transceiver is a graphic app that reads information from the headset, which is Arduino-based, and detects the yes/no gestures according to the detected movement.

In order to communicate with a serial device such as the headset and provide a client interface, electron was used. The electron project is located in the client-electron folder

## installation

- Open a command line tool in the "client-electron" folder. Then run `npm install`
- After the install, run `npm run rebuild` on the same folder. 
  - This command is required to make the serial port plugin work in electron, since it is originally designed to work on node.

* open a command line tool in the client-electron folder
* run the command `npm run start`. It should open a window showing the interface.

## configuration

* This app cannot be hosted in a server. This means that the IP address to which it sends the detected gestures is not automatic, but written manually. If you want host the nod-conference server yourself, you will need to change the target ip address in the `settings.js`file which is located at the root of the project. 
* It is also possible to change the SSL certificate and the ports for the server. The port configurations take effect for both, the server and electron app.
* 

# server

The server is a node app that communicates different people that may use the gesture detection apps. It also hosts an app intended to run in a phone, and an app to display the different users as emoticons.

The communication among different parts of this app is done via sockets. 

