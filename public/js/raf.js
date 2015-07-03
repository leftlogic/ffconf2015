/**
 * requestAnimationFrame shim layer with setTimeout fallback
 * @see http://paulirish.com/2011/requestanimationframe-for-smart-animating
 * modified for use with raf shim and raf based setInterval/Timeout
 */
(function() {
  'use strict';
  var lastTime = 0;
  var setTimeout = window.setTimeout;
  var clearTimeout = window.clearTimeout;
  var vendors = ['ms', 'moz', 'webkit', 'o'];
  for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
      window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
      window.cancelAnimationFrame =
        window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
  }

  if (!window.requestAnimationFrame) {
      window.requestAnimationFrame = function(callback) {
          var currTime = new Date().getTime();
          var timeToCall = Math.max(0, 16 - (currTime - lastTime));
          var id = setTimeout(function() { callback(currTime + timeToCall); },
            timeToCall);
          lastTime = currTime + timeToCall;
          return id;
      };
  }

  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function(id) {
        clearTimeout(id);
    };
  }
}());

var raf = (function () {
  'use strict';
  var queue = [];
  var lookup = {};
  var guid = 0;

  function clearQueue(time) {
    window.requestAnimationFrame(clearQueue);
    if (!queue.length || !raf.running) {
      return;
    }

    var todo = queue.splice(0); // move items across
    var i = 0;
    var item = null;
    var length = todo.length;
    for (; i < length; i++) {
      item = todo[i];
      if (!item.cancel) {
        item.fn(time);
      }
      delete lookup[item.guid];
    }
  }

  clearQueue();

  var raf = function raf(fn) {
    guid++;

    lookup[guid] = fn;

    queue.push({
      guid: guid,
      cancel: false,
      fn: fn,
    });

    return guid;
  };

  raf.running = true;

  raf.cancel = function (id) {
    if (lookup[id]) {
      lookup[id].cancel = true;
      return true;
    }

    return false;
  };

  return raf;
})();