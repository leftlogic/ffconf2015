var livetime = '2015-07-15T10:00:00.000Z';
// var livetime = '2015-07-15T08:00:00.000Z';
(function () {
'use strict';

var c = document.getElementById('countdown'),
    ctx = c.getContext('2d'),
    width = 200,
    height = 100,
    RAD = Math.PI / 180,
    audio = new Audio();

window.addEventListener('load', function() {
  audio.src = '/images/stay-on-target.mp3';
  c.onclick = function () {
    try {
      audio.play();
      audio.currentTime = 0;
    } catch (e) {}
  }
});

c.width = width;
var hw = width/2;
c.height = height;
var hh = height/2;

// ctx.fillRect(0, 0, width, height);
ctx.strokeStyle = '#FFEB3B';

var guid = 0;
function Frame(speed) {
  this.pos = 0.01;
  this.speed = 1 + speed/100;
  this.guid = ++guid;
  return this;
}

Frame.prototype = {
  draw: function () {
    var scale = this.pos;
    var w = width;
    var h = height * 2.1;
    var x = (w / 2 - w/2*scale);
    var y = (height / 2 - height/2*scale*2.1);

    ctx.moveTo(x, y);
    ctx.lineTo(x, y + h*scale);
    ctx.lineTo(x + width*scale, y + h*scale);
    ctx.lineTo(x + width*scale, y);
  },
  update: function () {
    this.pos = this.pos * this.speed;
  },
  finished: function () {
    return width / 2 - width/2*this.pos < 0;
  },
};

var boxes = [];

function radians(a) {
  return a * RAD;
}

function rotate(angle) {
  return {
    x: Math.cos(radians(angle)) * radius,
    y: Math.sin(radians(angle)) * radius,
  };
}

function square(angle) {
  ctx.save();
  ctx.translate(width/2, height/2);
  ctx.rotate(radians(angle));
  ctx.translate(-width/2, -height/2);
  /* criss cross...gunna make you... */
  // top-left -> bottom-right
  ctx.moveTo(0,0);
  ctx.lineTo(width, height);
  ctx.stroke();
  ctx.restore();
}

function init() {
  // ctx.fillRect(0, 0, width, height);
  ctx.lineWidth = 1;

  ctx.save();
  square(20);
  square(2);
  square(-16);
  square(-36);
  square(-55);
  square(-73);

  ctx.restore();
}

function pad(s, length) {
  var clen = (s+'').length;
  return Array(length - clen + 1).join('0') + s;
}

function text() {
  var d = Date.parse(livetime); // GMT (not BST)
  var seconds = (d - Date.now()) / 1000;
  if (seconds < 0) { seconds = 0; }
  var t = pad(seconds.toFixed(0), 8);
  var textWidth = ctx.measureText(t+'');
  ctx.fillText(t, width/2 - textWidth.width/2, 15);

  if (seconds === 0) {
    c.className = 'flash';
  }
}

function paintToBack() {
  var data = c.toDataURL('image/png');
  c.style.backgroundImage = 'url(' + data + ')';
  ctx.clearRect(0,0,width,height);
}

var tick = 0;

var speed = 15;

function draw(elapsedTime) {
  tick++;

  ctx.clearRect(0,0,width,height);
//   init();
  text();
  var spread = 6;

  if (tick % speed === 0) {
    var f = new Frame(spread);
    boxes.push(f);
  }


  // boxes
  var i = 0, length = boxes.length;
  for (i = 0; i < length; i++) {
    boxes[i].update();
  }

  i = 0;
  while (boxes[i]) {
    if (boxes[i].finished()) {
      boxes.splice(i, 1);
    } else {
      i++;
    }
  }

  ctx.beginPath();
  for (i = 0; i < boxes.length; i++) {
    boxes[i].draw();
  }
  ctx.closePath();
  ctx.stroke();
}

ctx.imageSmoothingEnabled = false;
init();
paintToBack();
ctx.font = '10px OCR-A';
ctx.fillStyle = '#FFEB3B';
ctx.lineWidth = 2;
window.raf.fps(draw, 30);
})();

  function request(type, url, opts, callback) {
  var xhr = new XMLHttpRequest(),
      fd;

  if (typeof opts === 'function') {
    callback = opts;
    opts = null;
  }

  xhr.open(type, url);

  if (type === 'POST' && opts) {
    fd = new FormData();

    for (var key in opts) {
      fd.append(key, JSON.stringify(opts[key]));
    }
  }

  xhr.onerror = function () {
    callback.call(xhr, new Error(xhr.status));
  };

  xhr.onload = function () {
    callback.call(xhr, null, JSON.parse(xhr.response));
  };

  xhr.send(opts ? fd : null);
}

function liveYet(error, live) {
  if (!live) {
    setTimeout(request.bind(null, 'get', '/are-we-live-yet-or-wot?', liveYet), 1000);
  } else {
    window.location.reload();
  }
}

function ping() {
  var a = Date.parse(livetime);
  var b = Date.now();
  if (a - b < (1000 * 60)) {
    // start to request
    return liveYet();
  }

  setTimeout(ping, (a - b)/2);
}

try {
  ping();
} catch (e) {
  console.log(e);
};