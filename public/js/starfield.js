// via http://jsfiddle.net/ditman/8Ffrw/
// Yes, I did just put a jsfiddle url in the page. Why wasn't it on jsbin? who
// knows, maybe the awesome sauce was too much... unlikely though :)

/**
 * The stars in our starfield!
 * Stars coordinate system is relative to the CENTER of the canvas
 * @param  {number} x
 * @param  {number} y
 */
var absoluteMaxSpeed = 0.01;
var Star = function(x, y, maxSpeed) {
    this.x = x;
    this.y = y;
    this.slope = y / x; // This only works because our origin is always (0,0)
    this.opacity = 0;
    this.speed = Math.max(Math.random() * maxSpeed, absoluteMaxSpeed);
};

/**
 * Compute the distance of this star relative to any other point in space.
 *
 * @param  {int} originX
 * @param  {int} originY
 *
 * @return {float} The distance of this star to the given origin
 */
Star.prototype.distanceTo = function(originX, originY) {
    return Math.sqrt(Math.pow(originX - this.x, 2) + Math.pow(originY - this.y, 2));
};

/**
 * Reinitializes this star's attributes, without re-creating it
 *
 * @param  {number} x
 * @param  {number} y
 *
 * @return {Star} this star
 */
Star.prototype.resetPosition = function(x, y, maxSpeed) {
    Star.apply(this, arguments);
    return this;
};

/**
 * The BigBang factory creates stars (Should be called StarFactory, but that is
 * a WAY LESS COOL NAME!
 * @type {Object}
 */
var BigBang = {
    /**
     * Returns a random star within a region of the space.
     *
     * @param  {number} minX minimum X coordinate of the region
     * @param  {number} minY minimum Y coordinate of the region
     * @param  {number} maxX maximum X coordinate of the region
     * @param  {number} maxY maximum Y coordinate of the region
     *
     * @return {Star} The random star
     */
    getRandomStar: function(minX, minY, maxX, maxY, maxSpeed) {
        var coords = BigBang.getRandomPosition(minX, minY, maxX, maxY);
        return new Star(coords.x, coords.y, maxSpeed);
    },

    /**
     * Gets a random (x,y) position within a bounding box
     *
     *
     * @param  {number} minX minimum X coordinate of the region
     * @param  {number} minY minimum Y coordinate of the region
     * @param  {number} maxX maximum X coordinate of the region
     * @param  {number} maxY maximum Y coordinate of the region
     *
     * @return {Object} An object with random {x, y} positions
     */
    getRandomPosition: function(minX, minY, maxX, maxY) {
      var angle = Math.random() * 360 * Math.PI / 180;
        return {
            x: Math.floor((Math.random() * maxX) + minX),
            y: Math.floor((Math.random() * maxY) + minY),
            // x: (Math.sin(angle) * maxX + minX),
            // y: (Math.cos(angle) * maxY + minY)
        };
    }
};

/**
 * Constructor function of our starfield. This just prepares the DOM nodes where
 * the scene will be rendered.
 *
 * @param {string} canvasId The DOM Id of the <div> containing a <canvas> tag
 */
var StarField = function(containerId) {
    this.container = document.getElementById(containerId);
    this.canvasElem = this.container.getElementsByTagName('canvas')[0];
    this.canvas = this.canvasElem.getContext('2d');

    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;

    this.starField = [];

    return this;
};

/**
 * Updates the properties for every star for the next frame to be rendered
 */
StarField.prototype._updateStarField = function() {
    var i,
        star,
        randomLoc,
        increment;

    for (i = 0; i < this.numStars; i++) {
        star = this.starField[i];

        increment = Math.min(star.speed, Math.abs(star.speed / star.slope));
        star.x += (star.x > 0) ? increment : -increment;
        star.y = star.slope * star.x;
        star.opacity += star.speed / 100;

        // Recycle star obj if it goes out of the frame
        if ((Math.abs(star.x) > this.width / 2) ||
            (Math.abs(star.y) > this.height / 2)) {
            randomLoc = BigBang.getRandomPosition(
                -this.width / 10, -this.height / 10,
                   this.width / 5, this.height / 5
            );
            // star.resetPosition(randomLoc.x, randomLoc.y, absoluteMaxSpeed); // this.maxStarSpeed
        }
    }
};

/**
 * Renders the whole starfield (background + stars)
 * This method could be made more efficient by just blipping each star,
 * and not redrawing the whole frame
 */
StarField.prototype._renderStarField = function() {
    var i,
        star;
    // Background
    this.canvas.fillStyle = "rgba(0, 0, 0, .5)";
    this.canvas.fillRect(0, 0, this.width, this.height);

    var grouping = this.numStars / 10 | 0;

    var o = []
    // Stars
    this.canvas.beginPath();
    for (i = 0; i < this.numStars; i++) {
        star = this.starField[i];
        // if (i % grouping === 0) {
        //   this.canvas.closePath();
        //   this.canvas.fillStyle = "rgba(200, 200, 200, " + star.opacity + ")";
        //   o.push(star.opacity);
        //   this.canvas.fill();
        //   this.canvas.beginPath();
        // }
        this.canvas.rect(
            star.x + this.width / 2,
            star.y + this.height / 2,
            2, 2);
    }
    this.canvas.closePath();
    this.canvas.fillStyle = "rgba(200, 200, 200, 0.4)";
    this.canvas.fill();

};

/**
 * Function that handles the animation of each frame. Update the starfield
 * positions and re-render
 */
StarField.prototype._renderFrame = function(elapsedTime) {
    var timeSinceLastFrame = elapsedTime - (this.prevFrameTime || 0);

    window.raf(this._renderFrame.bind(this));

    // Skip frames unless at least 30ms have passed since the last one
    // (Cap to ~30fps)
    if (timeSinceLastFrame >= 30 || !this.prevFrameTime) {
        this.prevFrameTime = elapsedTime;
        this._updateStarField();
        this._renderStarField();
    }
};

/**
 * Makes sure that the canvas size fits the size of its container
 */
StarField.prototype._adjustCanvasSize = function(width, height) {
    // Set the canvas size to match the container ID (and cache values)
    this.width = this.canvasElem.width = width || this.container.offsetWidth;
    this.height = this.canvasElem.height = height || this.container.offsetHeight;
};

/**
 * This listener compares the old container size with the new one, and caches
 * the new values.
 */
StarField.prototype._watchCanvasSize = function(elapsedTime) {
    var timeSinceLastCheck = elapsedTime - (this.prevCheckTime || 0),
        width,
        height;

    // window.raf(this._watchCanvasSize.bind(this));

    // Skip frames unless at least 333ms have passed since the last check
    // (Cap to ~3fps)
    if (timeSinceLastCheck >= 333 || !this.prevCheckTime) {
        this.prevCheckTime = elapsedTime;
        width = this.container.offsetWidth;
        height = this.container.offsetHeight;
        if (this.oldWidth !== width || this.oldHeight !== height) {
            this.oldWidth = width;
            this.oldHeight = height;
            this._adjustCanvasSize(width, height);
        }
    }
};

/**
 * Initializes the scene by resizing the canvas to the appropiate value, and
 * sets up the main loop.
 * @param {int} numStars Number of stars in our starfield
 */
StarField.prototype._initScene = function(numStars) {
    var i;
    for (i = 0; i < this.numStars; i++) {
        this.starField.push(
            BigBang.getRandomStar(-this.width / 2, -this.height / 2, this.width, this.height, this.maxStarSpeed)
        );
    }

    // Intervals not stored because I don't plan to detach them later...
    window.raf(this._renderFrame.bind(this));
    window.raf(this._watchCanvasSize.bind(this));
};

/**
 * Kicks off everything!
 * @param {int} numStars The number of stars to render
 * @param {int} maxStarSpeed Maximum speed of the stars (pixels / frame)
 */
StarField.prototype.render = function(numStars, maxStarSpeed) {
    this.numStars = numStars || 100;
    this.maxStarSpeed = maxStarSpeed || 3;

    this._initScene(this.numStars);
};

// Kick off!
var stars = new StarField('fullScreen');
stars.render(256, 20);
setTimeout(function () {
  // slow rate to 1
  var slow = function () {
    var maxSpeed = stars.maxStarSpeed *= .8;
    var i = 0, length = stars.starField.length;
    var brk = false;
    if (maxSpeed > .05) {
      for (; i < length; i++) {
        stars.starField[i].speed = Math.max(Math.random() * maxSpeed, absoluteMaxSpeed);
      }
      window.raf(slow);
    }
  }
  slow();
}, 750);