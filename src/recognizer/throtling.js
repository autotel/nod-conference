var throtling = function (callback, time) {
  var limit=1;
  /// a variable to monitor the count
  var calledCount = 0;
  /// refesh the `calledCount` varialbe after the `time` has been passed
  setInterval(function () {
      calledCount = 0;
  }, time);
  /// creating a clousre that will be called
  var closure = function (a,b,c,d,e) {
      /// checking the limit (if limit is exceeded then do not call the passed function
      if (limit > calledCount) {
          /// increase the count
          calledCount++;
          callback(a,b,c,d,e); /// call the function
      } else {
          // console.log('not calling because the limit is exeeded');
      }
  }
  return closure; /// return the closure
}
module.exports=throtling;
