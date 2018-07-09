var serviceStarted = Date.now();
var arrTo = {
    string: function (arr) {
        var result = "";
        arr.map(function (a) {
            result += String.fromCharCode(a);
        });
        return result;
    },
    uint(arr) {
        var ret = 0;
        //untested
        for (var a = 0; a < arr.length; a++) {
            ret |= arr[a] << a;
        }
        return ret;
    },
    int16(arr) {
        if (arr.length > 2) console.warn("int length>2", arr.length);
        var view = new DataView(new ArrayBuffer(2));
        for (var a = 0; a < arr.length; a++) {
            view.setUint8(a, arr[a]);
        }
        //forced little endian
        return view.getInt16(0, true);
    },
    float32(arr) {
        if (arr.length > 4) console.warn("float length>4", arr.length);
        var view = new DataView(new ArrayBuffer(4));
        for (var a = 0; a < arr.length; a++) {
            // view.setUint8(arr.length-(a+1), arr[a]);
            view.setUint8(a, arr[a]);
        }
        //forced little endian
        return view.getFloat32(0, true);
    }
}
module.exports = function (serialDevice, variables) {
    var self = this;
    // var mySerial = false;
    console.log("transceiver",serialDevice,variables);
    var addressVars = {};
    for (var vaname in variables) {
        var va = variables[vaname];
        addressVars[va.address] = va;
        // console.log("ADDR",va);
    }
    // console.log(addressVars);
    // return;
    var dataChopper = new DataChopper(addressVars);

    console.log("new Transceiver");
    this.onData = function () { };
    this.start = function () {
        serialDevice.connect(function (port, error) {
            if (error) {
                console.log(error);
            } else if (port) {
                mySerial = port;
            }
        });

        serialDevice.onData(function (data) {
            dataChopper.incom(data);
        });

        dataChopper.wholePacketReady = function (packet, type) {
            var now = Date.now() - serviceStarted;
            if (type.lastTime !== undefined) {
                var elapsed = now - type.lastTime;
            }
            if (type.avgInterval) {
                type.avgInterval = (elapsed + (type.avgInterval * 9)) / 10;
            } else {
                type.avgInterval = elapsed;
            }
            type.lastTime = now;
            var parsedValue = 0;
            if (arrTo[type.type]) {
                try {
                    parsedValue = arrTo[type.type](packet);
                } catch (e) {
                    console.error("error parsing value", e);
                    console.error("message data(type, packet):", type, packet);
                }
            } else {
                console.warn("unknown type for value", packet, type);
            }
            type.lastValue = parsedValue;
            self.onData(parsedValue, type);
        }
        return self;
    }
}


var DataChopper = function (vartypes) {
    var inBuff;
    var expectedLength;
    var byteNumber = 0;
    var recordingBuffer = false;
    var currentDataType = undefined;
    this.wholePacketReady = function (packet, type) {
        // console.log("packet ready",packet,type);
    }
    this.incom = function (data) {
        for (var a = 0; a < data.length; a++) {
            if (!recordingBuffer) {
                //we are expecting a message header, so we check what header current byte is
                //if is successfull, we start gathering or recording a new data packet.

                //byte  is in our header list?
                recordingBuffer = vartypes[data[a]] !== undefined;
                currentDataType = vartypes[data[a]];
                if (recordingBuffer) {

                    // console.log("new header:",data[a],"length:",vartypes[data[a]].expect);
                    expectedLength = vartypes[data[a]].expect;
                    // if (vartypes[data[a]].expect != -1){
                    //   expectedLength += 1;
                    // }
                    if (expectedLength == -1) {
                        inBuff = new Buffer(1024);
                    } else {
                        inBuff = new Buffer(expectedLength);
                    }
                    byteNumber = 0;
                } else {
                    console.log("stray byte");
                }


            } else if (recordingBuffer && expectedLength == -1) {

                expectedLength = data[a];
                // console.log("length indication",data[a]);
                inBuff = new Buffer(expectedLength);
                // fail();
            } else if (recordingBuffer) {

                // console.log("contextualized data",inBuff.length,inBuff);
                if (byteNumber < expectedLength - 1) {
                    //a new byte arrived and is added to the current packet
                    inBuff[byteNumber] = data[a];
                    byteNumber++;
                } else {
                    //a whole expected packet arrived
                    inBuff[byteNumber] = data[a];
                    this.wholePacketReady(inBuff, currentDataType);
                    recordingBuffer = false;
                    // console.log(inBuff);
                    byteNumber = 0;
                }
            } else {
                //a byte arrived, but there is no packet gathering bytes
                /**/
                console.log("stray byte: ", data[a], "in the context of: ", data);
                console.log("STR:", arrToString(data));
            }
        }
    }
    return this;
};
