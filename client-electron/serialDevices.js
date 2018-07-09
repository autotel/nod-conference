var SerialDevice = require('./SerialDevice.js');
var transceiver = require('./transceiver.js');

var angleToMag = function (x) {
    // http://fooplot.com/
    return Math.abs(Math.abs((x - 90) / 180) % 1 - 0.5) * 100 - 20
}
var magToMag = function (val) {
    return val / 2;
}

var variables = {
    "orientation.x": { expect: -1, address: 0xa, name: "orientation.x", type: "float32", colour: "red", value: 0, process: {}, magnitudeFunction: angleToMag },
    "orientation.y": { expect: -1, address: 0xb, name: "orientation.y", type: "float32", colour: "green", value: 0, process: {}, magnitudeFunction: angleToMag },
    "orientation.z": { expect: -1, address: 0xc, name: "orientation.z", type: "float32", colour: "blue", value: 0, process: {}, magnitudeFunction: angleToMag },
    "accel.x": { expect: -1, address: 0xd, name: "accel.x", type: "float32", colour: "cyan", value: 0, process: {}, magnitudeFunction: magToMag },
    "accel.y": { expect: -1, address: 0xe, name: "accel.y", type: "float32", colour: "magenta", value: 0, process: {}, magnitudeFunction: magToMag },
    "accel.z": { expect: -1, address: 0xf, name: "accel.z", type: "float32", colour: "yellow", value: 0, process: {}, magnitudeFunction: magToMag },
    "hardware logs": { address: 0x20, expect: -1, name: "debug", type: "string" },
};

for (name of ["orientation.x", "orientation.y", "orientation.z", "accel.x", "accel.y", "accel.z"]) {
    // variables[name]={}
    variables[name].name = name;
}

module.exports = new (function () {
    var self = this;
    var datacallback = function (type, tranc) { };
    this.onData = function (cb) {
        datacallback = cb;
    }
    this.transceivers = [];

    SerialDevice.list((err, ports) => {
        console.log('ports', ports);
        if (err) {
            console.error(err);
            return
        }
        if (ports.length === 0) {
            console.warn("no serial devices are connected");
            return
        }
        console.log(ports);
        for (var portData of ports) {
            var newSerialDevice = new SerialDevice(portData);
            var tranc = (new transceiver(newSerialDevice, variables)).start();
            tranc.onData = function (data, type) {
                // recognizer.data(parsedValue,type)
                type.value = data;
                // console.log(data,type);
                datacallback(type, tranc);
            }
            // self.transceivers.push(tranc);
        }
    })
})();