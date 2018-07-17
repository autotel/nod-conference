/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/recognizer/recognizer.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/recognizer/recognizer.js":
/*!**************************************!*\
  !*** ./src/recognizer/recognizer.js ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nvar throtling = __webpack_require__(/*! ./throtling */ \"./src/recognizer/throtling.js\")\r\nvar recognizer = new (function () {\r\n  console.log(\"RECOG\");\r\n  var self = this;\r\n  var LowPass = function (myVar) {\r\n    var self = this;\r\n    this.value = myVar.value;\r\n    this.name = myVar.name;\r\n    this.freq = 0.5;\r\n    var olderFramesDurations = [];\r\n    this.frame = function (timeDelta) {\r\n\r\n      var timespan = 1000 / self.freq;\r\n      var timespanM1 = 0;\r\n      var removeLast = 0;\r\n      for (var n in olderFramesDurations) {\r\n        // console.log(\"it\",n);\r\n        var sampleTime = olderFramesDurations[n];\r\n        var pre = timespanM1 + sampleTime;\r\n        if (pre + timeDelta >= timespan) {\r\n          // console.log(pre,\" >= \",timespan)\r\n          removeLast = n - olderFramesDurations.length;\r\n        } else {\r\n          timespanM1 = pre;\r\n        }\r\n      }\r\n      if (removeLast < 0) olderFramesDurations.splice(removeLast);\r\n\r\n      var effectiveFreq = timespanM1 + timeDelta;\r\n      // console.log(\"ffq\", effectiveFreq);\r\n\r\n      var marginal = myVar.value * timeDelta;\r\n      var main = self.value * timespanM1;\r\n      // if(timespanM1<0){\r\n      //   console.error(\"LPF frequency (\"+self.freq+\") is less than a sample frame duration (\"+timeDelta+\")\");\r\n      //   return;\r\n      // }\r\n\r\n      self.value = (marginal + main) / effectiveFreq;\r\n      olderFramesDurations.unshift(timeDelta);\r\n    }\r\n  }\r\n  var HiPass = function (myVar) {\r\n    var self = this;\r\n    this.value = myVar.value;\r\n    this.name = myVar.name;\r\n\r\n    this.freq = 10;\r\n    var lowPass = new LowPass(myVar);\r\n    // lowPass.freq = 2;\r\n    this.lowPass = lowPass;\r\n    // console.log(\"HIPASS\", this);\r\n    this.frame = function (timeDelta) {\r\n      if (lowPass.freq != self.freq) lowPass.freq = self.freq;\r\n      lowPass.frame(timeDelta);\r\n      self.value = myVar.value - lowPass.value;\r\n    }\r\n  }\r\n\r\n  var OnZeroCross = function (myVar, callback) {\r\n    var self = this;\r\n    this.value = 0;\r\n    this.name = myVar.name;\r\n    this.treshold = 1;\r\n    var lastValue = myVar.value;\r\n    this.frame = function (timeDelta) {\r\n      var crosses = (lastValue * myVar.value) < 0;\r\n      // console.log(lastValue,myVar.value);\r\n      if (crosses) {\r\n        var strength = (myVar.value - lastValue) * timeDelta;\r\n        if (strength > self.treshold) {\r\n          callback(strength);\r\n        }\r\n        self.value = strength;\r\n      }\r\n      lastValue = myVar.value;\r\n    }\r\n  }\r\n  var OnOscillation = function (myVar, callback) {\r\n    var self = this;\r\n    var throtledCallback = throtling(callback, 800);\r\n    this.value = 0;\r\n    //how many seconds three zero crossings need to take to be considered as oscillation\r\n    this.period = 2200;\r\n    this.name = myVar.name;\r\n    var zeroCrosses = [];\r\n\r\n\r\n    var lowCutFq = 10;\r\n    var hiCutFq = 20;\r\n\r\n    var hiPass = new HiPass(myVar);\r\n    var loPass = new LowPass(hiPass);\r\n\r\n    hiPass.freq = lowCutFq;\r\n    loPass.freq = hiCutFq;\r\n\r\n    myVar.process.hiPass = hiPass;\r\n    myVar.process.loPass = loPass;\r\n\r\n    this.zerox = myVar.process.xx = new OnZeroCross(loPass, function (strength) {\r\n      // if (Math.abs(strength) > self.treshold) {\r\n      // console.log(\"ZEROX\",strength);\r\n      zeroCrosses.unshift({ time: 0, strength: strength });\r\n      // console.log(zeroCrosses);\r\n      // }\r\n    });\r\n\r\n    this.frame = function (timeDelta,identifier) {\r\n      // console.log(identifier);\r\n      self.zerox.frame(timeDelta);\r\n      if (zeroCrosses[0] == undefined) return false;\r\n      zeroCrosses[0].time += timeDelta;\r\n      //remove overdue zero crosses\r\n      var tAmt = 0;\r\n      var damt = 0;\r\n      var totalTime = 0;\r\n      var slopeAvg = 0;\r\n      for (var i in zeroCrosses) {\r\n        tAmt += zeroCrosses[i].time;\r\n        slopeAvg += zeroCrosses[i].strength / zeroCrosses.length;\r\n        if (tAmt > self.period) {\r\n          damt += 1;\r\n        } else {\r\n          totalTime += zeroCrosses[i].time;\r\n        }\r\n      }\r\n      // console.log(\"oscs:\",zeroCrosses.length);\r\n      // console.log(\"splice\",damt);\r\n      if (damt > 0) zeroCrosses.splice(-damt);\r\n      if (zeroCrosses.length > 2) {\r\n        self.value = slopeAvg * zeroCrosses.length;\r\n        var frequency = zeroCrosses.length / (totalTime / 1000);\r\n        throtledCallback({\r\n          name: myVar.name,\r\n          strength: self.value,\r\n          oscillations: zeroCrosses.length,\r\n          slopeAverage: slopeAvg,\r\n          frequency: frequency,\r\n          time: identifier,\r\n        });\r\n      }\r\n    }\r\n  }\r\n\r\n\r\n  var vars = [];\r\n  document.addEventListener('DOMContentLoaded', function () {\r\n  });\r\n  var oscillationCallback = function () { };\r\n\r\n  this.onOscillation = function (callback) {\r\n    oscillationCallback = callback;\r\n  }\r\n\r\n  this.addVar = function (ivar) {\r\n    vars.push(ivar);\r\n    if (!ivar.value) ivar.value = 0;\r\n    ivar.process.onOsc = new OnOscillation(ivar,\r\n      function (evt) {\r\n        // console.log(strength);\r\n        oscillationCallback(evt);\r\n      });\r\n  }\r\n\r\n\r\n\r\n  this.frame = function (timeDelta,id) {\r\n    for (var a in vars) {\r\n      for (var b in vars[a].process) {\r\n        vars[a].process[b].frame(timeDelta,id);\r\n      }\r\n    }\r\n  }\r\n  return this;\r\n})();\r\nmodule.exports = recognizer;\r\nif (window) window.recognizer = recognizer;\r\n\n\n//# sourceURL=webpack:///./src/recognizer/recognizer.js?");

/***/ }),

/***/ "./src/recognizer/throtling.js":
/*!*************************************!*\
  !*** ./src/recognizer/throtling.js ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("var throtling = function (callback, time) {\r\n  var limit=1;\r\n  /// a variable to monitor the count\r\n  var calledCount = 0;\r\n  /// refesh the `calledCount` varialbe after the `time` has been passed\r\n  setInterval(function () {\r\n      calledCount = 0;\r\n  }, time);\r\n  /// creating a clousre that will be called\r\n  var closure = function (a,b,c,d,e) {\r\n      /// checking the limit (if limit is exceeded then do not call the passed function\r\n      if (limit > calledCount) {\r\n          /// increase the count\r\n          calledCount++;\r\n          callback(a,b,c,d,e); /// call the function\r\n      } else {\r\n          // console.log('not calling because the limit is exeeded');\r\n      }\r\n  }\r\n  return closure; /// return the closure\r\n}\r\nmodule.exports=throtling;\r\n\n\n//# sourceURL=webpack:///./src/recognizer/throtling.js?");

/***/ })

/******/ });