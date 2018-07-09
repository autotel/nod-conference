
const SerialPort = require('serialport');

var SerialDevice= function (portData) {
    function dataCallback(data) {
        console.log('Data:', data);
    }
    this.onData = function (callback) {
        dataCallback = callback;
    }
    this.connect = function (callback) {
        console.log("connecting port", portData.comName);
        var port = new SerialPort(portData.comName, {
            baudRate: 115200
        });
        port.on('open', function (err) {
            if (err) {
                callback(false, err);
            } else {
                callback(port, false);
                console.log(portData.comName, "ready");
            }
        });
        // port.on('data', function (data) {
        //   dataCallback(data);
        // });
        port.on('readable', function (data) {
            dataCallback(port.read());
        });

    };
    return this;
};
SerialDevice.list=SerialPort.list;
module.exports=SerialDevice;