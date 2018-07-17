'use strict';
var throtling = require('./throtling')
var recognizer = new (function () {
  console.log("RECOG");
  var self = this;
  var LowPass = function (myVar) {
    var self = this;
    this.value = myVar.value;
    this.name = myVar.name;
    this.freq = 0.5;
    var olderFramesDurations = [];
    this.frame = function (timeDelta) {

      var timespan = 1000 / self.freq;
      var timespanM1 = 0;
      var removeLast = 0;
      for (var n in olderFramesDurations) {
        // console.log("it",n);
        var sampleTime = olderFramesDurations[n];
        var pre = timespanM1 + sampleTime;
        if (pre + timeDelta >= timespan) {
          // console.log(pre," >= ",timespan)
          removeLast = n - olderFramesDurations.length;
        } else {
          timespanM1 = pre;
        }
      }
      if (removeLast < 0) olderFramesDurations.splice(removeLast);

      var effectiveFreq = timespanM1 + timeDelta;
      // console.log("ffq", effectiveFreq);

      var marginal = myVar.value * timeDelta;
      var main = self.value * timespanM1;
      // if(timespanM1<0){
      //   console.error("LPF frequency ("+self.freq+") is less than a sample frame duration ("+timeDelta+")");
      //   return;
      // }

      self.value = (marginal + main) / effectiveFreq;
      olderFramesDurations.unshift(timeDelta);
    }
  }
  var HiPass = function (myVar) {
    var self = this;
    this.value = myVar.value;
    this.name = myVar.name;

    this.freq = 10;
    var lowPass = new LowPass(myVar);
    // lowPass.freq = 2;
    this.lowPass = lowPass;
    // console.log("HIPASS", this);
    this.frame = function (timeDelta) {
      if (lowPass.freq != self.freq) lowPass.freq = self.freq;
      lowPass.frame(timeDelta);
      self.value = myVar.value - lowPass.value;
    }
  }

  var OnZeroCross = function (myVar, callback) {
    var self = this;
    this.value = 0;
    this.name = myVar.name;
    this.treshold = 1;
    var lastValue = myVar.value;
    this.frame = function (timeDelta) {
      var crosses = (lastValue * myVar.value) < 0;
      // console.log(lastValue,myVar.value);
      if (crosses) {
        var strength = (myVar.value - lastValue) * timeDelta;
        if (strength > self.treshold) {
          callback(strength);
        }
        self.value = strength;
      }
      lastValue = myVar.value;
    }
  }
  var OnOscillation = function (myVar, callback) {
    var self = this;
    var throtledCallback = throtling(callback, 800);
    this.value = 0;
    //how many seconds three zero crossings need to take to be considered as oscillation
    this.period = 2200;
    this.name = myVar.name;
    var zeroCrosses = [];


    var lowCutFq = 10;
    var hiCutFq = 20;

    var hiPass = new HiPass(myVar);
    var loPass = new LowPass(hiPass);

    hiPass.freq = lowCutFq;
    loPass.freq = hiCutFq;

    myVar.process.hiPass = hiPass;
    myVar.process.loPass = loPass;

    this.zerox = myVar.process.xx = new OnZeroCross(loPass, function (strength) {
      // if (Math.abs(strength) > self.treshold) {
      // console.log("ZEROX",strength);
      zeroCrosses.unshift({ time: 0, strength: strength });
      // console.log(zeroCrosses);
      // }
    });

    this.frame = function (timeDelta,identifier) {
      // console.log(identifier);
      self.zerox.frame(timeDelta);
      if (zeroCrosses[0] == undefined) return false;
      zeroCrosses[0].time += timeDelta;
      //remove overdue zero crosses
      var tAmt = 0;
      var damt = 0;
      var totalTime = 0;
      var slopeAvg = 0;
      for (var i in zeroCrosses) {
        tAmt += zeroCrosses[i].time;
        slopeAvg += zeroCrosses[i].strength / zeroCrosses.length;
        if (tAmt > self.period) {
          damt += 1;
        } else {
          totalTime += zeroCrosses[i].time;
        }
      }
      // console.log("oscs:",zeroCrosses.length);
      // console.log("splice",damt);
      if (damt > 0) zeroCrosses.splice(-damt);
      if (zeroCrosses.length > 2) {
        self.value = slopeAvg * zeroCrosses.length;
        var frequency = zeroCrosses.length / (totalTime / 1000);
        throtledCallback({
          name: myVar.name,
          strength: self.value,
          oscillations: zeroCrosses.length,
          slopeAverage: slopeAvg,
          frequency: frequency,
          time: identifier,
        });
      }
    }
  }


  var vars = [];
  document.addEventListener('DOMContentLoaded', function () {
  });
  var oscillationCallback = function () { };

  this.onOscillation = function (callback) {
    oscillationCallback = callback;
  }

  this.addVar = function (ivar) {
    vars.push(ivar);
    if (!ivar.value) ivar.value = 0;
    ivar.process.onOsc = new OnOscillation(ivar,
      function (evt) {
        // console.log(strength);
        oscillationCallback(evt);
      });
  }



  this.frame = function (timeDelta,id) {
    for (var a in vars) {
      for (var b in vars[a].process) {
        vars[a].process[b].frame(timeDelta,id);
      }
    }
  }
  return this;
})();
module.exports = recognizer;
if (window) window.recognizer = recognizer;
