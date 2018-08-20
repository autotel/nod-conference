
A set of apps to detect nod movement in the head from the rotation of an IMU.

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

