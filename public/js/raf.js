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

(function (global) {
  'use strict';
  var guid = 0;
  var lookup = {};

  function timer(repeat, fn, delay) {
    guid++;

    var args = [].slice.call(arguments, 3); // get the fn args
    var prevFrameTime = window.performance.now();
    var id = guid;

    function update(elapsedTime) {
      var timeSinceLastFrame = elapsedTime - (prevFrameTime || 0);

      if (repeat) {
        lookup[id] = raf(update);
      }

      if (timeSinceLastFrame < delay && prevFrameTime) {
        return;
      }

      fn.apply(global, args);
    }

    raf(update);

    return id;
  }

  window.setTimeout = function () {
    var args = [].slice.call(arguments, 0);
    return timer.apply(global, [false].concat(args));
  };

  window.setInterval = function () {
    var args = [].slice.call(arguments, 0);
    return timer.apply(global, [true].concat(args));
  };

  window.clearInterval = window.clearTimeout = function (id) {
    raf.cancel(id);
  };

})(this);


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