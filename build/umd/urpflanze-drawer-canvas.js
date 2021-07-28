/*!
 * @license Urpflanze DrawerCanvas v"0.2.0"
 * urpflanze-drawer-canvas.js
 *
 * Github: https://github.com/urpflanze-org/drawer-canvas
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["DrawerCanvas"] = factory();
	else
		root["DrawerCanvas"] = factory();
})(window, function() {
return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ([
/* 0 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(1), exports);
__exportStar(__webpack_require__(8), exports);
__exportStar(__webpack_require__(17), exports);
__exportStar(__webpack_require__(32), exports);
const BrowserDrawerCanvas_1 = __webpack_require__(32);
exports.default = BrowserDrawerCanvas_1.BrowserDrawerCanvas;
//# sourceMappingURL=index.js.map

/***/ }),
/* 1 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Timeline = void 0;
const Utilities_1 = __webpack_require__(2);
const math_1 = __webpack_require__(6);
const Emitter_1 = __webpack_require__(7);
/**
 * Is used for sequence time management.
 * It is necessary to set the duration and the number of frames per second (frame rate).
 *
 * @category Timeline
 * @class Timeline
 * @extends {Emitter<ITimelineEvents>}
 */
class Timeline extends Emitter_1.Emitter {
    constructor(duration = 60000, framerate = 30) {
        super();
        this.fps_samples_size = 30;
        this.fps_samples = [];
        this.fps_samples_index = 0;
        this.paused_time = 0;
        this.sequence = {
            duration,
            framerate,
            frames: Math.round((duration / 1000) * framerate),
        };
        this.tick_time = 1000 / this.sequence.framerate;
        this.fps = this.sequence.framerate;
        this.b_sequence_started = false;
        this.currentFrame = 0;
        this.currentTime = 0;
        this.last_tick = 0;
        this.start_time = 0;
    }
    //#region sequence meta
    /**
     * Return the sequence
     *
     * @returns {Sequence}
     */
    getSequence() {
        return { ...this.sequence };
    }
    /**
     * Set Sequence
     *
     * @param {number} duration in ms
     * @param {number} framerate
     * @param {number} atTime
     */
    setSequence(duration, framerate, atTime) {
        this.sequence.duration = duration;
        this.sequence.framerate = framerate;
        this.tick_time = 1000 / this.sequence.framerate;
        this.sequence.frames = Math.round((this.sequence.duration / 1000) * this.sequence.framerate);
        if (typeof atTime !== 'undefined') {
            this.setTime(atTime);
        }
        else {
            this.dispatch('timeline:update_sequence', this.getSequence());
        }
    }
    /**
     * Set duration of timeline
     *
     * @param {number} framerate
     */
    setDuration(duration) {
        this.setSequence(duration, this.sequence.framerate);
    }
    /**
     * Get timeline duration
     *
     * @returns {number}
     */
    getDuration() {
        return this.sequence.duration;
    }
    /**
     * Return framerate
     *
     * @returns {number}
     */
    getFramerate() {
        return this.sequence.framerate;
    }
    /**
     * Set a framerate
     *
     * @param {number} framerate
     */
    setFramerate(framerate) {
        this.setSequence(this.sequence.duration, framerate);
    }
    /**
     * Get number of frames based on duration and framerate
     *
     * @returns {number}
     */
    getFramesCount() {
        return this.sequence.frames;
    }
    //#endregion meta
    //#region change status
    bSequenceStarted() {
        return this.b_sequence_started;
    }
    /**
     * Start the sequence
     *
     */
    start() {
        if (!this.b_sequence_started) {
            this.b_sequence_started = true;
            this.start_time = this.paused_time;
            this.dispatch('timeline:change_status', Timeline.START);
        }
    }
    /**
     * Pause the sequence
     *
     */
    pause() {
        if (this.b_sequence_started) {
            this.paused_time = Utilities_1.now();
            this.b_sequence_started = false;
            this.dispatch('timeline:change_status', Timeline.PAUSE);
        }
    }
    /**
     * Stop the sequence and reset
     *
     */
    stop() {
        if (this.b_sequence_started) {
            this.b_sequence_started = false;
            this.currentTime = 0;
            this.currentFrame = 0;
            this.start_time = 0;
            this.paused_time = 0;
            this.dispatch('timeline:change_status', Timeline.STOP);
        }
    }
    /**
     * Animation tick
     *
     * @param {number} timestamp current timestamp
     * @returns {boolean}
     */
    tick(timestamp) {
        if (this.b_sequence_started) {
            if (!this.start_time) {
                this.start_time = timestamp;
                this.last_tick = -this.tick_time;
            }
            const currentTime = timestamp - this.start_time;
            const elapsed = currentTime - this.last_tick;
            if (elapsed >= this.tick_time) {
                this.calculateFPS(1 / (elapsed / 1000));
                this.last_tick = currentTime;
                this.currentTime = (currentTime - (elapsed % this.tick_time)) % this.sequence.duration;
                this.currentFrame = this.getFrameAtTime(this.currentTime);
                this.dispatch('timeline:progress', {
                    currentFrame: this.currentFrame,
                    currentTime: this.currentTime,
                    fps: this.fps,
                });
                return true;
            }
        }
        return false;
    }
    /**
     * Calculate fps
     *
     * @private
     * @param {number} currentFPS
     */
    calculateFPS(currentFPS) {
        const samples = this.fps_samples.length;
        if (samples > 0) {
            let average = 0;
            for (let i = 0; i < samples; i++)
                average += this.fps_samples[i];
            this.fps = Math.round(average / samples);
        }
        this.fps_samples[this.fps_samples_index] = Math.round(currentFPS);
        this.fps_samples_index = (this.fps_samples_index + 1) % this.fps_samples_size;
    }
    //#endregion
    //#region Frame and Time
    /**
     * Return current animation frame
     *
     * @returns {number}
     */
    getCurrentFrame() {
        return this.currentFrame;
    }
    /**
     * get the time at specific frame number
     *
     * @param {number} frame
     * @returns {number}
     */
    getFrameTime(frame) {
        frame = math_1.mod(frame, this.sequence.frames);
        return (frame * this.tick_time) % this.sequence.duration;
    }
    /**
     * Return frame number at time
     *
     * @param {number} time
     * @returns {number}
     */
    getFrameAtTime(time) {
        return Math.round((time % this.sequence.duration) / this.tick_time);
    }
    /**
     * set current frame
     *
     * @param {number} frame
     */
    setFrame(frame) {
        this.currentFrame = math_1.mod(frame, this.sequence.frames);
        this.currentTime = this.getFrameTime(this.currentFrame);
        this.dispatch('timeline:progress', {
            currentFrame: this.currentFrame,
            currentTime: this.currentTime,
            fps: this.fps,
        });
    }
    /**
     * Return tick time (based on framerate)
     *
     * @returns {number}
     */
    getTickTime() {
        return this.tick_time;
    }
    /**
     * Return the current time
     *
     * @returns {number}
     */
    getTime() {
        return this.currentTime;
    }
    /**
     * Set animation at time
     *
     * @param {number} time
     */
    setTime(time) {
        time = math_1.mod(time, this.sequence.duration);
        this.currentTime = time;
        this.currentFrame = this.getFrameAtTime(time);
        this.dispatch('timeline:progress', {
            currentFrame: this.currentFrame,
            currentTime: this.currentTime,
            fps: this.fps,
        });
    }
}
exports.Timeline = Timeline;
/**
 * Animation status started
 * @internal
 */
Timeline.START = 'start';
/**
 * Animation status paused
 * @internal
 */
Timeline.PAUSE = 'pause';
/**
 * Animation status stop
 * @internal
 */
Timeline.STOP = 'stop';
//# sourceMappingURL=Timeline.js.map

/***/ }),
/* 2 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.distributePointsInBuffer = exports.interpolate = exports.prepareBufferForInterpolation = exports.distanceFromRepetition = exports.angle2FromRepetition = exports.angleFromRepetition = exports.random = exports.noise = exports.relativeClamp = exports.clamp = exports.lerp = exports.toRadians = exports.toDegrees = exports.now = void 0;
const SimplexNoise = __webpack_require__(3);
const repetitions_1 = __webpack_require__(4);
const Vec2_1 = __webpack_require__(5);
// isDef: (object: any): boolean => typeof object !== 'undefined' && object !== null,
const measurement = typeof performance !== 'undefined' ? performance : Date;
/**
 * Get current timestamp in milliseconds
 *
 * @category Utilities
 * @returns {number}
 */
function now() {
    return measurement.now();
}
exports.now = now;
// aOr: (...args: Array<any>): any => {
// 	for (let i = 0; i < args.length; i++) if (Utilities.isDef(args[i])) return args[i]
// },
/**
 * Convert number from radians to degrees
 *
 * @category Utilities
 *
 * @example
 * ```javascript
 * Urpflanze.toDegrees(Math.PI) // 180
 * ```
 *
 * @param {number} radians
 * @returns {number}
 */
function toDegrees(radians) {
    return (radians * 180) / Math.PI;
}
exports.toDegrees = toDegrees;
/**
 * Convert angle from degrees to radians
 * @example
 * ```javascript
 * Urpflanze.toRadians(180) // 3.141592653589793
 * ```
 *
 * @category Utilities
 * @param {number} degrees
 * @returns {number}
 */
function toRadians(degrees) {
    return (degrees * Math.PI) / 180;
}
exports.toRadians = toRadians;
// perf: (name: string, callback: any, log: boolean = false): number => {
// 	const t1 = now()
// 	callback()
// 	const t2 = now()
// 	log && console.log('perf ' + name + ': ' + (t2 - t1))
// 	return t2 - t1
// }
/**
 * Linear interpolation from `a` when `i` as 0 an `b` when `i' as 1
 *
 * @category Utilities
 * @param {number} a
 * @param {number} b
 * @param {number} i
 * @returns {number}
 */
function lerp(a, b, i) {
    return (1 - i) * a + i * b;
}
exports.lerp = lerp;
/**
 * Return number between min and max
 *
 * @category Utilities
 * @example
 * ```javascript
 * Urpflanze.clamp(0, 1, 1.2) // 1
 * Urpflanze.clamp(0, 1, -2) // 0
 * ```
 * @param {number} min
 * @param {number} max
 * @param {number} value
 * @returns {number}
 */
function clamp(min, max, value) {
    return value <= min ? min : value >= max ? max : value;
}
exports.clamp = clamp;
/**
 * Map number between refMin e refMax from min and max
 *
 * @category Utilities
 *
 * @example
 * ```javascript
 * Urpflanze.relativeClamp(0, 1, 0.5, 100, 200) // 150
 * ```
 *
 * @param {number} refMin
 * @param {number} refMax
 * @param {number} value
 * @param {number} toMin
 * @param {number} toMax
 * @returns {number}
 */
function relativeClamp(refMin, refMax, value, toMin, toMax) {
    return clamp(toMin, toMax, ((value - refMin) / (refMax - refMin)) * (toMax - toMin) + toMin);
}
exports.relativeClamp = relativeClamp;
/**
 * @internal
 * @ignore
 */
const noises = {
    random: new SimplexNoise(Math.random),
};
/**
 * <a href="https://github.com/jwagner/simplex-noise.js" target="_blank">SimplexNoise</a>
 * Use 'random' as seed property for random seed.
 * Return value between -1 and 1
 *
 * @category Utilities
 *
 * @param {string} [seed='random']
 * @param {number} [x=0]
 * @param {number} [y=0]
 * @param {number} [z=0]
 * @returns {number} between -1 and 1
 */
function noise(seed = 'random', x = 0, y = 0, z = 0) {
    if (typeof noises[seed] === 'undefined') {
        noises[seed] = new SimplexNoise(seed);
    }
    return noises[seed].noise3D(x, y, z);
}
exports.noise = noise;
/**
 * Random number generator
 */
const randoms = {};
/**
 * random number generator
 * @param seed
 * @returns
 */
function random(seed, min = 0, max = 1, decimals) {
    const key = seed + '';
    if (typeof randoms[key] === 'undefined') {
        const seed = xmur3(key);
        randoms[key] = sfc32(seed(), seed(), seed(), seed());
    }
    const value = min + randoms[key]() * (max - min);
    return typeof decimals !== 'undefined' ? Math.round(value * 10 ** decimals) / 10 ** decimals : value;
}
exports.random = random;
/**
 *
 * @internal
 * @param str
 * @returns
 */
function xmur3(str) {
    let i = 0, h = 1779033703 ^ str.length;
    for (; i < str.length; i++)
        (h = Math.imul(h ^ str.charCodeAt(i), 3432918353)), (h = (h << 13) | (h >>> 19));
    return function () {
        h = Math.imul(h ^ (h >>> 16), 2246822507);
        h = Math.imul(h ^ (h >>> 13), 3266489909);
        return (h ^= h >>> 16) >>> 0;
    };
}
/**
 * @internal
 * @param a
 * @param b
 * @param c
 * @param d
 * @returns
 */
function sfc32(a, b, c, d) {
    return function () {
        a >>>= 0;
        b >>>= 0;
        c >>>= 0;
        d >>>= 0;
        let t = (a + b) | 0;
        a = b ^ (b >>> 9);
        b = (c + (c << 3)) | 0;
        c = (c << 21) | (c >>> 11);
        d = (d + 1) | 0;
        t = (t + d) | 0;
        c = (c + t) | 0;
        return (t >>> 0) / 4294967296;
    };
}
/**
 * Return angle (atan) from offset (or center) for matrix repetition.
 * Offset is array between [-1, -1] and [1, 1].
 * The return value is between -Math.PI / 2 and Math.PI / 2
 *
 * @category Utilities
 *
 * @param {IRepetition} repetition
 * @param {[number, number]} offsetFromCenter
 * @returns {number} between -Math.PI / 2 and Math.PI / 2
 */
function angleFromRepetition(repetition, offsetFromCenter = [0, 0]) {
    if (repetition.type === repetitions_1.ERepetitionType.Matrix) {
        const centerMatrix = [(repetition.col.count - 1) / 2, (repetition.row.count - 1) / 2];
        centerMatrix[0] += centerMatrix[0] * offsetFromCenter[0];
        centerMatrix[1] += centerMatrix[1] * offsetFromCenter[1];
        const x = repetition.col.index - 1 - centerMatrix[0];
        const y = repetition.row.index - 1 - centerMatrix[1];
        return x === 0 ? 0 : Math.atan(y / x);
    }
    return (repetition.angle - Math.PI) / 2;
}
exports.angleFromRepetition = angleFromRepetition;
/**
 * Return angle (atan2, 4 quadrants) from offset (or center) for matrix repetition.
 * Offset is array between [-1, -1] and [1, 1].
 * The return value is between -Math.PI an Math.PI
 *
 * @category Utilities
 *
 * @param {IRepetition} repetition
 * @param {[number, number]} offsetFromCenter
 * @returns {number} between -Math.PI an Math.PI
 */
function angle2FromRepetition(repetition, offsetFromCenter = [0, 0]) {
    if (repetition.type === repetitions_1.ERepetitionType.Matrix) {
        const centerMatrix = [(repetition.col.count - 1) / 2, (repetition.row.count - 1) / 2];
        centerMatrix[0] += centerMatrix[0] * offsetFromCenter[0];
        centerMatrix[1] += centerMatrix[1] * offsetFromCenter[1];
        const x = repetition.col.index - 1 - centerMatrix[0];
        const y = repetition.row.index - 1 - centerMatrix[1];
        return x === 0 ? 0 : Math.atan2(y, x);
    }
    return repetition.angle - Math.PI;
}
exports.angle2FromRepetition = angle2FromRepetition;
/**
 * Return distance from offset (or center) for matrix repetition.
 * The return value is between 0 and 1
 *
 * @category Utilities
 *
 * @param {IRepetition} repetition
 * @param {[number, number]} offsetFromCenter offset relative to distance prop
 * @returns {number} between 0 and 1
 */
function distanceFromRepetition(repetition, offsetFromCenter = [0, 0]) {
    if (repetition.type === repetitions_1.ERepetitionType.Matrix) {
        const centerMatrix = [0.5, 0.5];
        centerMatrix[0] += centerMatrix[0] * offsetFromCenter[0];
        centerMatrix[1] += centerMatrix[1] * offsetFromCenter[1];
        const current = [repetition.col.offset, repetition.row.offset];
        return Vec2_1.default.distance(current, centerMatrix);
    }
    return 1;
}
exports.distanceFromRepetition = distanceFromRepetition;
/// Interpolation
/**
 *
 * @param from
 * @param to
 * @returns
 */
function prepareBufferForInterpolation(from, to) {
    const fromBufferLength = from.length;
    const toBufferLength = to.length;
    if (fromBufferLength === toBufferLength) {
        return [from, to];
    }
    const maxBufferLength = fromBufferLength > toBufferLength ? fromBufferLength : toBufferLength;
    const difference = Math.abs(fromBufferLength - toBufferLength);
    const minBufferLength = maxBufferLength - difference;
    /////
    const b = fromBufferLength < toBufferLength ? to : from;
    const t = fromBufferLength < toBufferLength ? from : to;
    const a = distributePointsInBuffer(t, Math.floor(difference / 2));
    // a[maxBufferLength - 2] = t[minBufferLength - 2]
    // a[maxBufferLength - 1] = t[minBufferLength - 1]
    return fromBufferLength > toBufferLength ? [b, a] : [a, b];
}
exports.prepareBufferForInterpolation = prepareBufferForInterpolation;
/**
 *
 * @param from
 * @param to
 * @param offset
 * @returns
 */
function interpolate(from, to, initialOffset = 0.5) {
    const [a, b] = prepareBufferForInterpolation(from, to);
    const maxBufferLength = Math.max(a.length, b.length);
    const offset = typeof initialOffset === 'number' ? [initialOffset] : initialOffset;
    const maxPoints = maxBufferLength / 2;
    if (offset.length !== maxPoints) {
        const tl = offset.length;
        for (let i = 0; i < maxPoints; i++) {
            offset[i] = offset[i % tl];
        }
    }
    ////
    const result = new Float32Array(maxBufferLength);
    for (let i = 0, off = 0; i < maxBufferLength; i += 2, off++) {
        result[i] = (1 - offset[off]) * a[i] + offset[off] * b[i];
        result[i + 1] = (1 - offset[off]) * a[i + 1] + offset[off] * b[i + 1];
    }
    return result;
}
exports.interpolate = interpolate;
function distributePointsInBuffer(buffer, count) {
    const bufferLen = buffer.length;
    const pointsLen = bufferLen / 2;
    const finalBufferLength = (pointsLen + count) * 2;
    const edges = pointsLen - 1;
    if (edges > 1) {
        const lastPoint = bufferLen - 2;
        const newPointsOnEdge = Math.floor(count / edges);
        const bufferWithPointsEveryEdge = bufferLen + newPointsOnEdge * lastPoint;
        let remainingPoints = (finalBufferLength - bufferWithPointsEveryEdge) / 2;
        const edgeRemainingIndex = Math.round(edges / remainingPoints);
        const result = new Float32Array(finalBufferLength);
        for (let i = 0, edgeIndex = 0, r = 0; i < lastPoint; i += 2, edgeIndex++, r += 2) {
            const ax = buffer[i];
            const ay = buffer[i + 1];
            const bx = buffer[i + 2];
            const by = buffer[i + 3];
            result[r] = ax;
            result[r + 1] = ay;
            const addReminingPoints = remainingPoints > 0 && (edgeIndex % edgeRemainingIndex === 0 || i === lastPoint - 2);
            const currentPointsOnEdge = newPointsOnEdge + (addReminingPoints ? 1 : 0);
            const newPointOffset = 1 / (currentPointsOnEdge + 1);
            for (let h = 0; h < currentPointsOnEdge; h++, r += 2) {
                const o = newPointOffset * (h + 1);
                result[r + 2] = (1 - o) * ax + o * bx;
                result[r + 3] = (1 - o) * ay + o * by;
            }
            if (addReminingPoints) {
                remainingPoints--;
            }
        }
        result[finalBufferLength - 2] = buffer[bufferLen - 2];
        result[finalBufferLength - 1] = buffer[bufferLen - 1];
        return result;
    }
    const result = new Float32Array(finalBufferLength);
    for (let i = 0; i < finalBufferLength; i += 2) {
        result[i] = buffer[i % bufferLen];
        result[i + 1] = buffer[(i + 1) % bufferLen];
    }
    return result;
}
exports.distributePointsInBuffer = distributePointsInBuffer;
//# sourceMappingURL=Utilities.js.map

/***/ }),
/* 3 */
/***/ ((module, exports, __webpack_require__) => {

var __WEBPACK_AMD_DEFINE_RESULT__;/*
 * A fast javascript implementation of simplex noise by Jonas Wagner

Based on a speed-improved simplex noise algorithm for 2D, 3D and 4D in Java.
Which is based on example code by Stefan Gustavson (stegu@itn.liu.se).
With Optimisations by Peter Eastman (peastman@drizzle.stanford.edu).
Better rank ordering method by Stefan Gustavson in 2012.


 Copyright (c) 2018 Jonas Wagner

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 */
(function() {
  'use strict';

  var F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
  var G2 = (3.0 - Math.sqrt(3.0)) / 6.0;
  var F3 = 1.0 / 3.0;
  var G3 = 1.0 / 6.0;
  var F4 = (Math.sqrt(5.0) - 1.0) / 4.0;
  var G4 = (5.0 - Math.sqrt(5.0)) / 20.0;

  function SimplexNoise(randomOrSeed) {
    var random;
    if (typeof randomOrSeed == 'function') {
      random = randomOrSeed;
    }
    else if (randomOrSeed) {
      random = alea(randomOrSeed);
    } else {
      random = Math.random;
    }
    this.p = buildPermutationTable(random);
    this.perm = new Uint8Array(512);
    this.permMod12 = new Uint8Array(512);
    for (var i = 0; i < 512; i++) {
      this.perm[i] = this.p[i & 255];
      this.permMod12[i] = this.perm[i] % 12;
    }

  }
  SimplexNoise.prototype = {
    grad3: new Float32Array([1, 1, 0,
      -1, 1, 0,
      1, -1, 0,

      -1, -1, 0,
      1, 0, 1,
      -1, 0, 1,

      1, 0, -1,
      -1, 0, -1,
      0, 1, 1,

      0, -1, 1,
      0, 1, -1,
      0, -1, -1]),
    grad4: new Float32Array([0, 1, 1, 1, 0, 1, 1, -1, 0, 1, -1, 1, 0, 1, -1, -1,
      0, -1, 1, 1, 0, -1, 1, -1, 0, -1, -1, 1, 0, -1, -1, -1,
      1, 0, 1, 1, 1, 0, 1, -1, 1, 0, -1, 1, 1, 0, -1, -1,
      -1, 0, 1, 1, -1, 0, 1, -1, -1, 0, -1, 1, -1, 0, -1, -1,
      1, 1, 0, 1, 1, 1, 0, -1, 1, -1, 0, 1, 1, -1, 0, -1,
      -1, 1, 0, 1, -1, 1, 0, -1, -1, -1, 0, 1, -1, -1, 0, -1,
      1, 1, 1, 0, 1, 1, -1, 0, 1, -1, 1, 0, 1, -1, -1, 0,
      -1, 1, 1, 0, -1, 1, -1, 0, -1, -1, 1, 0, -1, -1, -1, 0]),
    noise2D: function(xin, yin) {
      var permMod12 = this.permMod12;
      var perm = this.perm;
      var grad3 = this.grad3;
      var n0 = 0; // Noise contributions from the three corners
      var n1 = 0;
      var n2 = 0;
      // Skew the input space to determine which simplex cell we're in
      var s = (xin + yin) * F2; // Hairy factor for 2D
      var i = Math.floor(xin + s);
      var j = Math.floor(yin + s);
      var t = (i + j) * G2;
      var X0 = i - t; // Unskew the cell origin back to (x,y) space
      var Y0 = j - t;
      var x0 = xin - X0; // The x,y distances from the cell origin
      var y0 = yin - Y0;
      // For the 2D case, the simplex shape is an equilateral triangle.
      // Determine which simplex we are in.
      var i1, j1; // Offsets for second (middle) corner of simplex in (i,j) coords
      if (x0 > y0) {
        i1 = 1;
        j1 = 0;
      } // lower triangle, XY order: (0,0)->(1,0)->(1,1)
      else {
        i1 = 0;
        j1 = 1;
      } // upper triangle, YX order: (0,0)->(0,1)->(1,1)
      // A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and
      // a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where
      // c = (3-sqrt(3))/6
      var x1 = x0 - i1 + G2; // Offsets for middle corner in (x,y) unskewed coords
      var y1 = y0 - j1 + G2;
      var x2 = x0 - 1.0 + 2.0 * G2; // Offsets for last corner in (x,y) unskewed coords
      var y2 = y0 - 1.0 + 2.0 * G2;
      // Work out the hashed gradient indices of the three simplex corners
      var ii = i & 255;
      var jj = j & 255;
      // Calculate the contribution from the three corners
      var t0 = 0.5 - x0 * x0 - y0 * y0;
      if (t0 >= 0) {
        var gi0 = permMod12[ii + perm[jj]] * 3;
        t0 *= t0;
        n0 = t0 * t0 * (grad3[gi0] * x0 + grad3[gi0 + 1] * y0); // (x,y) of grad3 used for 2D gradient
      }
      var t1 = 0.5 - x1 * x1 - y1 * y1;
      if (t1 >= 0) {
        var gi1 = permMod12[ii + i1 + perm[jj + j1]] * 3;
        t1 *= t1;
        n1 = t1 * t1 * (grad3[gi1] * x1 + grad3[gi1 + 1] * y1);
      }
      var t2 = 0.5 - x2 * x2 - y2 * y2;
      if (t2 >= 0) {
        var gi2 = permMod12[ii + 1 + perm[jj + 1]] * 3;
        t2 *= t2;
        n2 = t2 * t2 * (grad3[gi2] * x2 + grad3[gi2 + 1] * y2);
      }
      // Add contributions from each corner to get the final noise value.
      // The result is scaled to return values in the interval [-1,1].
      return 70.0 * (n0 + n1 + n2);
    },
    // 3D simplex noise
    noise3D: function(xin, yin, zin) {
      var permMod12 = this.permMod12;
      var perm = this.perm;
      var grad3 = this.grad3;
      var n0, n1, n2, n3; // Noise contributions from the four corners
      // Skew the input space to determine which simplex cell we're in
      var s = (xin + yin + zin) * F3; // Very nice and simple skew factor for 3D
      var i = Math.floor(xin + s);
      var j = Math.floor(yin + s);
      var k = Math.floor(zin + s);
      var t = (i + j + k) * G3;
      var X0 = i - t; // Unskew the cell origin back to (x,y,z) space
      var Y0 = j - t;
      var Z0 = k - t;
      var x0 = xin - X0; // The x,y,z distances from the cell origin
      var y0 = yin - Y0;
      var z0 = zin - Z0;
      // For the 3D case, the simplex shape is a slightly irregular tetrahedron.
      // Determine which simplex we are in.
      var i1, j1, k1; // Offsets for second corner of simplex in (i,j,k) coords
      var i2, j2, k2; // Offsets for third corner of simplex in (i,j,k) coords
      if (x0 >= y0) {
        if (y0 >= z0) {
          i1 = 1;
          j1 = 0;
          k1 = 0;
          i2 = 1;
          j2 = 1;
          k2 = 0;
        } // X Y Z order
        else if (x0 >= z0) {
          i1 = 1;
          j1 = 0;
          k1 = 0;
          i2 = 1;
          j2 = 0;
          k2 = 1;
        } // X Z Y order
        else {
          i1 = 0;
          j1 = 0;
          k1 = 1;
          i2 = 1;
          j2 = 0;
          k2 = 1;
        } // Z X Y order
      }
      else { // x0<y0
        if (y0 < z0) {
          i1 = 0;
          j1 = 0;
          k1 = 1;
          i2 = 0;
          j2 = 1;
          k2 = 1;
        } // Z Y X order
        else if (x0 < z0) {
          i1 = 0;
          j1 = 1;
          k1 = 0;
          i2 = 0;
          j2 = 1;
          k2 = 1;
        } // Y Z X order
        else {
          i1 = 0;
          j1 = 1;
          k1 = 0;
          i2 = 1;
          j2 = 1;
          k2 = 0;
        } // Y X Z order
      }
      // A step of (1,0,0) in (i,j,k) means a step of (1-c,-c,-c) in (x,y,z),
      // a step of (0,1,0) in (i,j,k) means a step of (-c,1-c,-c) in (x,y,z), and
      // a step of (0,0,1) in (i,j,k) means a step of (-c,-c,1-c) in (x,y,z), where
      // c = 1/6.
      var x1 = x0 - i1 + G3; // Offsets for second corner in (x,y,z) coords
      var y1 = y0 - j1 + G3;
      var z1 = z0 - k1 + G3;
      var x2 = x0 - i2 + 2.0 * G3; // Offsets for third corner in (x,y,z) coords
      var y2 = y0 - j2 + 2.0 * G3;
      var z2 = z0 - k2 + 2.0 * G3;
      var x3 = x0 - 1.0 + 3.0 * G3; // Offsets for last corner in (x,y,z) coords
      var y3 = y0 - 1.0 + 3.0 * G3;
      var z3 = z0 - 1.0 + 3.0 * G3;
      // Work out the hashed gradient indices of the four simplex corners
      var ii = i & 255;
      var jj = j & 255;
      var kk = k & 255;
      // Calculate the contribution from the four corners
      var t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
      if (t0 < 0) n0 = 0.0;
      else {
        var gi0 = permMod12[ii + perm[jj + perm[kk]]] * 3;
        t0 *= t0;
        n0 = t0 * t0 * (grad3[gi0] * x0 + grad3[gi0 + 1] * y0 + grad3[gi0 + 2] * z0);
      }
      var t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
      if (t1 < 0) n1 = 0.0;
      else {
        var gi1 = permMod12[ii + i1 + perm[jj + j1 + perm[kk + k1]]] * 3;
        t1 *= t1;
        n1 = t1 * t1 * (grad3[gi1] * x1 + grad3[gi1 + 1] * y1 + grad3[gi1 + 2] * z1);
      }
      var t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
      if (t2 < 0) n2 = 0.0;
      else {
        var gi2 = permMod12[ii + i2 + perm[jj + j2 + perm[kk + k2]]] * 3;
        t2 *= t2;
        n2 = t2 * t2 * (grad3[gi2] * x2 + grad3[gi2 + 1] * y2 + grad3[gi2 + 2] * z2);
      }
      var t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
      if (t3 < 0) n3 = 0.0;
      else {
        var gi3 = permMod12[ii + 1 + perm[jj + 1 + perm[kk + 1]]] * 3;
        t3 *= t3;
        n3 = t3 * t3 * (grad3[gi3] * x3 + grad3[gi3 + 1] * y3 + grad3[gi3 + 2] * z3);
      }
      // Add contributions from each corner to get the final noise value.
      // The result is scaled to stay just inside [-1,1]
      return 32.0 * (n0 + n1 + n2 + n3);
    },
    // 4D simplex noise, better simplex rank ordering method 2012-03-09
    noise4D: function(x, y, z, w) {
      var perm = this.perm;
      var grad4 = this.grad4;

      var n0, n1, n2, n3, n4; // Noise contributions from the five corners
      // Skew the (x,y,z,w) space to determine which cell of 24 simplices we're in
      var s = (x + y + z + w) * F4; // Factor for 4D skewing
      var i = Math.floor(x + s);
      var j = Math.floor(y + s);
      var k = Math.floor(z + s);
      var l = Math.floor(w + s);
      var t = (i + j + k + l) * G4; // Factor for 4D unskewing
      var X0 = i - t; // Unskew the cell origin back to (x,y,z,w) space
      var Y0 = j - t;
      var Z0 = k - t;
      var W0 = l - t;
      var x0 = x - X0; // The x,y,z,w distances from the cell origin
      var y0 = y - Y0;
      var z0 = z - Z0;
      var w0 = w - W0;
      // For the 4D case, the simplex is a 4D shape I won't even try to describe.
      // To find out which of the 24 possible simplices we're in, we need to
      // determine the magnitude ordering of x0, y0, z0 and w0.
      // Six pair-wise comparisons are performed between each possible pair
      // of the four coordinates, and the results are used to rank the numbers.
      var rankx = 0;
      var ranky = 0;
      var rankz = 0;
      var rankw = 0;
      if (x0 > y0) rankx++;
      else ranky++;
      if (x0 > z0) rankx++;
      else rankz++;
      if (x0 > w0) rankx++;
      else rankw++;
      if (y0 > z0) ranky++;
      else rankz++;
      if (y0 > w0) ranky++;
      else rankw++;
      if (z0 > w0) rankz++;
      else rankw++;
      var i1, j1, k1, l1; // The integer offsets for the second simplex corner
      var i2, j2, k2, l2; // The integer offsets for the third simplex corner
      var i3, j3, k3, l3; // The integer offsets for the fourth simplex corner
      // simplex[c] is a 4-vector with the numbers 0, 1, 2 and 3 in some order.
      // Many values of c will never occur, since e.g. x>y>z>w makes x<z, y<w and x<w
      // impossible. Only the 24 indices which have non-zero entries make any sense.
      // We use a thresholding to set the coordinates in turn from the largest magnitude.
      // Rank 3 denotes the largest coordinate.
      i1 = rankx >= 3 ? 1 : 0;
      j1 = ranky >= 3 ? 1 : 0;
      k1 = rankz >= 3 ? 1 : 0;
      l1 = rankw >= 3 ? 1 : 0;
      // Rank 2 denotes the second largest coordinate.
      i2 = rankx >= 2 ? 1 : 0;
      j2 = ranky >= 2 ? 1 : 0;
      k2 = rankz >= 2 ? 1 : 0;
      l2 = rankw >= 2 ? 1 : 0;
      // Rank 1 denotes the second smallest coordinate.
      i3 = rankx >= 1 ? 1 : 0;
      j3 = ranky >= 1 ? 1 : 0;
      k3 = rankz >= 1 ? 1 : 0;
      l3 = rankw >= 1 ? 1 : 0;
      // The fifth corner has all coordinate offsets = 1, so no need to compute that.
      var x1 = x0 - i1 + G4; // Offsets for second corner in (x,y,z,w) coords
      var y1 = y0 - j1 + G4;
      var z1 = z0 - k1 + G4;
      var w1 = w0 - l1 + G4;
      var x2 = x0 - i2 + 2.0 * G4; // Offsets for third corner in (x,y,z,w) coords
      var y2 = y0 - j2 + 2.0 * G4;
      var z2 = z0 - k2 + 2.0 * G4;
      var w2 = w0 - l2 + 2.0 * G4;
      var x3 = x0 - i3 + 3.0 * G4; // Offsets for fourth corner in (x,y,z,w) coords
      var y3 = y0 - j3 + 3.0 * G4;
      var z3 = z0 - k3 + 3.0 * G4;
      var w3 = w0 - l3 + 3.0 * G4;
      var x4 = x0 - 1.0 + 4.0 * G4; // Offsets for last corner in (x,y,z,w) coords
      var y4 = y0 - 1.0 + 4.0 * G4;
      var z4 = z0 - 1.0 + 4.0 * G4;
      var w4 = w0 - 1.0 + 4.0 * G4;
      // Work out the hashed gradient indices of the five simplex corners
      var ii = i & 255;
      var jj = j & 255;
      var kk = k & 255;
      var ll = l & 255;
      // Calculate the contribution from the five corners
      var t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0 - w0 * w0;
      if (t0 < 0) n0 = 0.0;
      else {
        var gi0 = (perm[ii + perm[jj + perm[kk + perm[ll]]]] % 32) * 4;
        t0 *= t0;
        n0 = t0 * t0 * (grad4[gi0] * x0 + grad4[gi0 + 1] * y0 + grad4[gi0 + 2] * z0 + grad4[gi0 + 3] * w0);
      }
      var t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1 - w1 * w1;
      if (t1 < 0) n1 = 0.0;
      else {
        var gi1 = (perm[ii + i1 + perm[jj + j1 + perm[kk + k1 + perm[ll + l1]]]] % 32) * 4;
        t1 *= t1;
        n1 = t1 * t1 * (grad4[gi1] * x1 + grad4[gi1 + 1] * y1 + grad4[gi1 + 2] * z1 + grad4[gi1 + 3] * w1);
      }
      var t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2 - w2 * w2;
      if (t2 < 0) n2 = 0.0;
      else {
        var gi2 = (perm[ii + i2 + perm[jj + j2 + perm[kk + k2 + perm[ll + l2]]]] % 32) * 4;
        t2 *= t2;
        n2 = t2 * t2 * (grad4[gi2] * x2 + grad4[gi2 + 1] * y2 + grad4[gi2 + 2] * z2 + grad4[gi2 + 3] * w2);
      }
      var t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3 - w3 * w3;
      if (t3 < 0) n3 = 0.0;
      else {
        var gi3 = (perm[ii + i3 + perm[jj + j3 + perm[kk + k3 + perm[ll + l3]]]] % 32) * 4;
        t3 *= t3;
        n3 = t3 * t3 * (grad4[gi3] * x3 + grad4[gi3 + 1] * y3 + grad4[gi3 + 2] * z3 + grad4[gi3 + 3] * w3);
      }
      var t4 = 0.6 - x4 * x4 - y4 * y4 - z4 * z4 - w4 * w4;
      if (t4 < 0) n4 = 0.0;
      else {
        var gi4 = (perm[ii + 1 + perm[jj + 1 + perm[kk + 1 + perm[ll + 1]]]] % 32) * 4;
        t4 *= t4;
        n4 = t4 * t4 * (grad4[gi4] * x4 + grad4[gi4 + 1] * y4 + grad4[gi4 + 2] * z4 + grad4[gi4 + 3] * w4);
      }
      // Sum up and scale the result to cover the range [-1,1]
      return 27.0 * (n0 + n1 + n2 + n3 + n4);
    }
  };

  function buildPermutationTable(random) {
    var i;
    var p = new Uint8Array(256);
    for (i = 0; i < 256; i++) {
      p[i] = i;
    }
    for (i = 0; i < 255; i++) {
      var r = i + ~~(random() * (256 - i));
      var aux = p[i];
      p[i] = p[r];
      p[r] = aux;
    }
    return p;
  }
  SimplexNoise._buildPermutationTable = buildPermutationTable;

  function alea() {
    // Johannes Baagøe <baagoe@baagoe.com>, 2010
    var s0 = 0;
    var s1 = 0;
    var s2 = 0;
    var c = 1;

    var mash = masher();
    s0 = mash(' ');
    s1 = mash(' ');
    s2 = mash(' ');

    for (var i = 0; i < arguments.length; i++) {
      s0 -= mash(arguments[i]);
      if (s0 < 0) {
        s0 += 1;
      }
      s1 -= mash(arguments[i]);
      if (s1 < 0) {
        s1 += 1;
      }
      s2 -= mash(arguments[i]);
      if (s2 < 0) {
        s2 += 1;
      }
    }
    mash = null;
    return function() {
      var t = 2091639 * s0 + c * 2.3283064365386963e-10; // 2^-32
      s0 = s1;
      s1 = s2;
      return s2 = t - (c = t | 0);
    };
  }
  function masher() {
    var n = 0xefc8249d;
    return function(data) {
      data = data.toString();
      for (var i = 0; i < data.length; i++) {
        n += data.charCodeAt(i);
        var h = 0.02519603282416938 * n;
        n = h >>> 0;
        h -= n;
        h *= n;
        n = h >>> 0;
        h -= n;
        n += h * 0x100000000; // 2^32
      }
      return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
    };
  }

  // amd
  if (true) !(__WEBPACK_AMD_DEFINE_RESULT__ = (function() {return SimplexNoise;}).call(exports, __webpack_require__, exports, module),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  // common js
  if (true) exports.SimplexNoise = SimplexNoise;
  // browser
  else {}
  // nodejs
  if (true) {
    module.exports = SimplexNoise;
  }

})();


/***/ }),
/* 4 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ERepetitionType = void 0;
/**
 * Repetition type enumerator.
 *
 * @category Core.Repetition
 * @internal
 */
var ERepetitionType;
(function (ERepetitionType) {
    /**
     * Defines the type of repetition of the shape,
     * in a circular way starting from the center of the scene
     * @order 1
     */
    ERepetitionType[ERepetitionType["Ring"] = 1] = "Ring";
    /**
     * Defines the type of repetition of the shape,
     * on a nxm grid starting from the center of the scene
     * @order 2
     */
    ERepetitionType[ERepetitionType["Matrix"] = 2] = "Matrix";
})(ERepetitionType = exports.ERepetitionType || (exports.ERepetitionType = {}));
//# sourceMappingURL=repetitions.js.map

/***/ }),
/* 5 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
/**
 * Temporany matrix
 *
 * @internal
 * @ignore
 */
const MATRIX = new Array(4);
/**
 * Vec2 operation
 *
 * @category Core.Utilities
 */
const Vec2 = {
    /**
     * from new vertex
     *
     * @param {Array<number> | number} [x=0]
     * @param {number} [y]
     * @returns {Array<number>}
     */
    from: (x = 0, y) => {
        const out = new Array(2);
        if (typeof x === 'number') {
            out[0] = x;
            out[1] = y !== null && y !== void 0 ? y : x;
        }
        else {
            out[0] = x[0];
            out[1] = x[1];
        }
        return out;
    },
    normalize: (v) => {
        const len = Vec2.length(v);
        return len !== 0 ? [v[0] / len, v[1] / len] : [0, 0];
    },
    /**
     * Distance between two points
     *
     * @param {Array<number>} a
     * @param {Array<number>} b
     * @returns {number}
     */
    distance: (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]),
    /**
     * dot product
     *
     * @param {Array<number>} a
     * @param {Array<number>} b
     * @returns {number}
     */
    dot: (a, b) => a[0] * b[0] + a[1] * b[1],
    /**
     * length of point
     *
     * @param {Array<number>} vec
     * @returns {number}
     */
    length: (vec) => Math.hypot(vec[0], vec[1]),
    /**
     * angle between two point
     *
     * @param {Array<number>} a
     * @param {Array<number>} b
     * @returns {number}
     */
    angle: (a, b) => {
        a = Vec2.normalize(a);
        b = Vec2.normalize(b);
        return Math.acos(Vec2.dot(a, b));
    },
    /**
     * skewX point
     *
     * @param {Array<number>} vec
     * @param {number} m
     */
    skewX: (vec, m) => {
        vec[0] += Math.tan(m) * vec[1];
    },
    /**
     * skewY point
     *
     * @param {Array<number>} vec
     * @param {number} m
     */
    skewY: (vec, m) => {
        vec[1] += Math.tan(m) * vec[0];
    },
    /**
     * squeezeX point
     *
     * @param {Array<number>} vec
     * @param {number} m
     */
    squeezeX: (vec, m) => {
        vec[1] += vec[1] * (vec[0] * -m);
    },
    /**
     * squeezeY point
     *
     * @param {Array<number>} vec
     * @param {number} m
     */
    squeezeY: (vec, m) => {
        vec[0] += vec[0] * (vec[1] * m);
    },
    /**
     * Rotate point
     *
     * @param {Array<number>} vec
     * @param {Array<number>} MATRIX
     * @param {Array<number>} fromPoint
     * @internal
     */
    rotate: (vec, MATRIX, fromPoint) => {
        const p0 = vec[0] - fromPoint[0];
        const p1 = vec[1] - fromPoint[1];
        vec[0] = p0 * MATRIX[0] + p1 * MATRIX[1] + fromPoint[0];
        vec[1] = p0 * MATRIX[2] + p1 * MATRIX[3] + fromPoint[1];
    },
    /**
     * RotateX point
     *
     * @param {Array<number>} vec
     * @param {Array<number>} fromPoint
     * @param {number} rad
     */
    rotateX: (vec, fromPoint, rad) => {
        MATRIX[0] = 1;
        MATRIX[1] = 0;
        MATRIX[2] = 0;
        MATRIX[3] = Math.cos(rad);
        Vec2.rotate(vec, MATRIX, fromPoint);
    },
    /**
     * RotateY point
     *
     * @param {Array<number>} vec
     * @param {Array<number>} fromPoint
     * @param {number} rad
     */
    rotateY: (vec, fromPoint, rad) => {
        MATRIX[0] = Math.cos(rad);
        MATRIX[1] = 0;
        MATRIX[2] = 0;
        MATRIX[3] = 1;
        Vec2.rotate(vec, MATRIX, fromPoint);
    },
    /**
     * RotateZ point
     *
     * @param {Array<number>} vec
     * @param {Array<number>} fromPoint
     * @param {number} rad
     */
    rotateZ: (vec, fromPoint, rad) => {
        MATRIX[0] = Math.cos(rad);
        MATRIX[1] = -Math.sin(rad);
        MATRIX[2] = Math.sin(rad);
        MATRIX[3] = Math.cos(rad);
        Vec2.rotate(vec, MATRIX, fromPoint);
    },
    /**
     * Translate vertex
     *
     * @param {Array<number>} vec
     * @param {Array<number>} to
     */
    translate: (vec, to) => {
        vec[0] += to[0];
        vec[1] += to[1];
    },
    /**
     * Scale vertex
     *
     * @param {Array<number>} vec
     * @param {Array<number>} to
     */
    scale: (vec, to) => {
        vec[0] *= to[0];
        vec[1] *= to[1];
    },
    /**
     * Scale vertex
     *
     * @param {Array<number>} vec
     * @param {Array<number>} to
     */
    divide: (vec, to) => {
        vec[0] /= to[0];
        vec[1] /= to[1];
    },
    /**
     * Vec to string
     *
     * @param {Array<number>} vec
     * @return {string}
     */
    toString: (vec) => `x: ${vec[0]}, y: ${vec[1]}`,
    /**
     * Vertex [0, 0]
     */
    ZERO: Array.from([0, 0]),
    /**
     * Vertex [1, 1]
     */
    ONE: Array.from([1, 1]),
};
exports.default = Vec2;
//# sourceMappingURL=Vec2.js.map

/***/ }),
/* 6 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.mod = exports.PHI = exports.PI2 = exports.log = void 0;
/**
 * Return logarith value and base
 *
 * @category Core.Utilities
 *
 * @param n number
 * @param base number
 */
const log = (n, base) => Math.log(n) / Math.log(base);
exports.log = log;
/**
 * @category Core.Utilities
 */
exports.PI2 = Math.PI * 2;
/**
 * @category Core.Utilities
 */
exports.PHI = (1 + Math.sqrt(5)) / 2;
/**
 * Return a positive module of positive or negative value
 *
 * @category Core.Utilities
 *
 * @param value number
 * @param base number
 */
const mod = (value, base) => {
    const result = value % base;
    return result < 0 ? result + base : result;
};
exports.mod = mod;
//# sourceMappingURL=index.js.map

/***/ }),
/* 7 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Emitter = void 0;
/**
 * Class used for emit and dispatch events
 *
 * @category Emitter
 * @abstract
 * @class Emitter
 * @template EventTypes
 */
class Emitter {
    constructor() {
        this.callbacks = {};
    }
    /**
     * Attach callback at event
     *
     * @param {keyof EventTypes} e
     * @param {(value: EventTypes[keyof EventTypes]) => any} callback
     * @memberof Emitter
     */
    attach(e, callback) {
        if (!(e in this.callbacks)) {
            this.callbacks[e] = [];
        }
        this.callbacks[e].push(callback);
    }
    /**
     * Remove callbach listener at event
     *
     * @param {keyof EventTypes} e
     * @param {(value: EventTypes[keyof EventTypes]) => void} callback
     * @memberof Emitter
     */
    detach(e, callback) {
        if (e in this.callbacks) {
            const index = this.callbacks[e].indexOf(callback);
            if (index >= 0) {
                this.callbacks[e].splice(index, 1);
            }
        }
    }
    /**
     * Dispatch event
     *
     * @param {keyof EventTypes} e
     * @param {EventTypes[keyof EventTypes]} [params]
     * @memberof Emitter
     */
    dispatch(e, params) {
        if (e in this.callbacks && this.callbacks[e].length > 0) {
            for (let i = 0, len = this.callbacks[e].length; i < len; i++)
                if (this.callbacks[e][i](params) === false)
                    break;
        }
    }
}
exports.Emitter = Emitter;
//# sourceMappingURL=Emitter.js.map

/***/ }),
/* 8 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DrawerCanvas = void 0;
const color_1 = __webpack_require__(9);
const Utilities_1 = __webpack_require__(2);
const math_1 = __webpack_require__(6);
const Vec2_1 = __webpack_require__(5);
const canvas_1 = __webpack_require__(14);
const Emitter_1 = __webpack_require__(7);
const Timeline_1 = __webpack_require__(1);
const utils_1 = __webpack_require__(16);
/**
 *
 * @category DrawerCanvas
 * @extends {Emitter<DrawerCanvasEvents>}
 */
class DrawerCanvas extends Emitter_1.Emitter {
    constructor(scene, canvasOrContainer, drawerOptions, duration = 60000, framerate = 60) {
        var _a, _b, _c, _d, _e;
        super();
        this.drawerOptions = {
            width: (drawerOptions === null || drawerOptions === void 0 ? void 0 : drawerOptions.width) || (scene === null || scene === void 0 ? void 0 : scene.width) || 400,
            height: (drawerOptions === null || drawerOptions === void 0 ? void 0 : drawerOptions.height) || (scene === null || scene === void 0 ? void 0 : scene.height) || 400,
            clear: (_a = drawerOptions === null || drawerOptions === void 0 ? void 0 : drawerOptions.clear) !== null && _a !== void 0 ? _a : true,
            time: (_b = drawerOptions === null || drawerOptions === void 0 ? void 0 : drawerOptions.time) !== null && _b !== void 0 ? _b : 0,
            simmetricLines: (_c = drawerOptions === null || drawerOptions === void 0 ? void 0 : drawerOptions.simmetricLines) !== null && _c !== void 0 ? _c : 0,
            noBackground: (_d = drawerOptions === null || drawerOptions === void 0 ? void 0 : drawerOptions.noBackground) !== null && _d !== void 0 ? _d : false,
            ghosts: (drawerOptions === null || drawerOptions === void 0 ? void 0 : drawerOptions.ghosts) || 0,
            ghostAlpha: (drawerOptions === null || drawerOptions === void 0 ? void 0 : drawerOptions.ghostAlpha) === false ? false : true,
            ghostSkipTime: (_e = drawerOptions === null || drawerOptions === void 0 ? void 0 : drawerOptions.ghostSkipTime) !== null && _e !== void 0 ? _e : 30,
            ghostSkipFunction: drawerOptions === null || drawerOptions === void 0 ? void 0 : drawerOptions.ghostSkipFunction,
            sceneFit: (drawerOptions === null || drawerOptions === void 0 ? void 0 : drawerOptions.sceneFit) || 'contain',
            backgroundImage: drawerOptions === null || drawerOptions === void 0 ? void 0 : drawerOptions.backgroundImage,
            backgroundImageFit: (drawerOptions === null || drawerOptions === void 0 ? void 0 : drawerOptions.backgroundImageFit) || 'cover',
        };
        this.timeline = new Timeline_1.Timeline(duration, framerate);
        this.timeline.setTime(this.drawerOptions.time);
        this.draw_id = null;
        this.redraw_id = null;
        this.animation_id = null;
        if (scene) {
            this.setScene(scene);
        }
        if (!utils_1.bWorker || (utils_1.bWorker && canvasOrContainer instanceof OffscreenCanvas))
            this.setCanvas(canvasOrContainer);
    }
    /**
     * Return option value or default
     *
     * @param {K keyof IDrawerCanvasOptions} name
     * @param {IDrawerCanvasOptions[K]} defaultValue
     */
    getOption(name, defaultValue) {
        var _a;
        return (_a = this.drawerOptions[name]) !== null && _a !== void 0 ? _a : defaultValue;
    }
    /**
     * Create instance of canvas (HTMLCanvasElement in browser o Canvas in Node)
     */
    setCanvas(canvasOrContainer) {
        if (utils_1.bWorker) {
            if (canvasOrContainer instanceof OffscreenCanvas) {
                this.canvas = canvasOrContainer;
            }
            else {
                console.error('Cannot set cavas');
            }
        }
        else {
            if (utils_1.bBrowser) {
                const canvas = canvas_1.createCanvas(this.drawerOptions.width, this.drawerOptions.height);
                if (canvasOrContainer instanceof HTMLElement &&
                    !(canvasOrContainer instanceof HTMLCanvasElement || canvasOrContainer instanceof OffscreenCanvas)) {
                    this.canvas = canvas;
                    while (canvasOrContainer.lastChild)
                        canvasOrContainer.removeChild(canvasOrContainer.lastChild);
                    canvasOrContainer.appendChild(canvas);
                }
                else {
                    this.canvas = typeof canvasOrContainer === 'undefined' ? canvas : canvasOrContainer;
                }
            }
            else {
                this.canvas = canvas_1.createCanvas(this.drawerOptions.width, this.drawerOptions.height);
            }
        }
        if (this.canvas) {
            this.canvas.width = this.drawerOptions.width;
            this.canvas.height = this.drawerOptions.height;
            this.context = this.canvas.getContext('2d', {
                alpha: true,
                // desynchronized: true,
            });
        }
    }
    /**
     * Return instance of canvas
     *
     * @returns canvas
     */
    getCanvas() {
        return this.canvas;
    }
    setScene(scene) {
        this.scene = scene;
    }
    draw() {
        if (this.context === null || typeof this.scene === 'undefined')
            return 0;
        const start_time = Utilities_1.now();
        const timeline = this.timeline;
        const drawAtTime = timeline.getTime();
        const drawerOptions = {
            ...this.drawerOptions,
            ghostIndex: undefined,
            clear: this.drawerOptions.clear || timeline.getCurrentFrame() <= 1,
            time: drawAtTime,
        };
        const currentFrame = timeline.getFrameAtTime(drawAtTime);
        this.dispatch('drawer-canvas:before_draw', {
            currentFrame: currentFrame,
            currentTime: drawAtTime,
        });
        if (drawerOptions.simmetricLines > 0) {
            if (drawerOptions.clear) {
                DrawerCanvas.clear(this.context, drawerOptions.width, drawerOptions.height, drawerOptions.noBackground ? false : this.scene.background, drawerOptions.backgroundImage, drawerOptions.backgroundImageFit);
            }
            DrawerCanvas.drawSimmetricLines(this.context, drawerOptions.simmetricLines, drawerOptions.width, drawerOptions.height, this.scene.color);
            drawerOptions.clear = false;
        }
        if (drawerOptions.ghosts) {
            const ghostDrawerOptions = {
                ...drawerOptions,
            };
            const drawAtTime = timeline.getTime();
            const sequenceDuration = timeline.getDuration();
            const ghostRepetition = {
                offset: 0,
                index: 0,
                count: drawerOptions.ghosts,
            };
            for (let i = 1; i <= drawerOptions.ghosts; i++) {
                ghostRepetition.index = i;
                ghostRepetition.offset = ghostRepetition.index / ghostRepetition.count;
                const ghostTime = drawAtTime -
                    (drawerOptions.ghostSkipFunction
                        ? drawerOptions.ghostSkipFunction(ghostRepetition, drawAtTime)
                        : i * drawerOptions.ghostSkipTime);
                ghostDrawerOptions.ghostIndex = i;
                ghostDrawerOptions.time = math_1.mod(ghostTime, sequenceDuration);
                ghostDrawerOptions.clear = drawerOptions.clear && ghostDrawerOptions.ghostIndex === 1;
                this.realDraw(ghostDrawerOptions);
            }
            drawerOptions.clear = false;
        }
        this.realDraw(drawerOptions);
        return Utilities_1.now() - start_time;
    }
    realDraw(options) {
        var _a;
        const width = this.drawerOptions.width;
        const height = this.drawerOptions.height;
        const context = this.context;
        const scene = this.scene;
        const time = (_a = options.time) !== null && _a !== void 0 ? _a : 0;
        const bGhost = typeof options.ghosts !== 'undefined' &&
            options.ghosts > 0 &&
            typeof options.ghostIndex !== 'undefined' &&
            options.ghostIndex > 0;
        const ghostMultiplier = bGhost ? 1 - options.ghostIndex / (options.ghosts + 0.5) : 0;
        const ghostAlpha = options.ghostAlpha === true;
        const sceneFit = utils_1.fit(scene.width, scene.height, width, height, this.drawerOptions.sceneFit);
        const translateX = sceneFit.x;
        const translateY = sceneFit.y;
        options.clear &&
            DrawerCanvas.clear(context, width, height, options.noBackground ? false : scene.background, options.backgroundImage, options.backgroundImageFit);
        let logFillColorWarn = false;
        let logStrokeColorWarn = false;
        scene.currentTime = time;
        const sceneChilds = scene.getChildren();
        for (let i = 0, len = sceneChilds.length; i < len; i++) {
            const sceneChild = sceneChilds[i];
            if (!sceneChild.data ||
                (!(sceneChild.data.visible === false) && !(bGhost && sceneChild.data.disableGhost === true))) {
                sceneChilds[i].generate(time, true);
                const childIndexedBuffer = sceneChilds[i].getIndexedBuffer() || [];
                const childBuffer = sceneChilds[i].getBuffer() || [];
                let childVertexIndex = 0;
                for (let currentBufferIndex = 0, len = childIndexedBuffer.length; currentBufferIndex < len; currentBufferIndex++) {
                    const currentIndexing = childIndexedBuffer[currentBufferIndex];
                    const shape = currentIndexing.shape;
                    const propArguments = {
                        canvasContext: context,
                        ...currentIndexing,
                    };
                    const composite = DrawerCanvas.getStreamDrawerProp(shape, 'composite', propArguments, 'source-over');
                    context.globalCompositeOperation = composite;
                    context.beginPath();
                    context.moveTo(childBuffer[childVertexIndex] * sceneFit.scale + translateX, childBuffer[childVertexIndex + 1] * sceneFit.scale + translateY);
                    childVertexIndex += 2;
                    for (let currentFrameLength = childVertexIndex + currentIndexing.frameLength - 2; childVertexIndex < currentFrameLength; childVertexIndex += 2)
                        context.lineTo(childBuffer[childVertexIndex] * sceneFit.scale + translateX, childBuffer[childVertexIndex + 1] * sceneFit.scale + translateY);
                    if (shape.isClosed())
                        context.closePath();
                    const alpha = DrawerCanvas.getStreamDrawerProp(shape, 'opacity', propArguments, 1);
                    context.globalAlpha = alpha;
                    const shadowColor = DrawerCanvas.getStreamDrawerProp(shape, 'shadowColor', propArguments);
                    const shadowBlur = DrawerCanvas.getStreamDrawerProp(shape, 'shadowBlur', propArguments);
                    const shadowOffsetX = DrawerCanvas.getStreamDrawerProp(shape, 'shadowOffsetX', propArguments);
                    const shadowOffsetY = DrawerCanvas.getStreamDrawerProp(shape, 'shadowOffsetY', propArguments);
                    context.shadowColor = shadowColor;
                    context.shadowBlur = shadowBlur;
                    shadowOffsetX && (context.shadowOffsetX = shadowOffsetX);
                    shadowOffsetY && (context.shadowOffsetY = shadowOffsetY);
                    let fill = DrawerCanvas.getStreamDrawerProp(shape, 'fill', propArguments);
                    if (typeof fill !== 'undefined') {
                        if (bGhost && ghostAlpha) {
                            const color = DrawerCanvas.ghostifyColor(fill, ghostMultiplier);
                            if (color) {
                                fill = color;
                            }
                            else if (!logFillColorWarn) {
                                console.warn(`[Urpflanze:DrawerCanvas] Unable ghost fill color '${fill}',
								please enter a rgba or hsla color`);
                                logFillColorWarn = true;
                            }
                        }
                        context.fillStyle = fill;
                        context.fill();
                    }
                    let stroke = DrawerCanvas.getStreamDrawerProp(shape, 'stroke', propArguments, typeof fill === 'undefined' ? scene.color : undefined);
                    let lineWidth = DrawerCanvas.getStreamDrawerProp(shape, 'lineWidth', propArguments, 1);
                    if (stroke) {
                        if (bGhost && ghostAlpha) {
                            const color = DrawerCanvas.ghostifyColor(stroke, ghostMultiplier);
                            if (color) {
                                stroke = color;
                            }
                            else if (!logStrokeColorWarn) {
                                console.warn(`[Urpflanze:DrawerCanvas] Unable ghost stroke color '${stroke}',
								please enter a rgba or hsla color`);
                                logStrokeColorWarn = true;
                            }
                            lineWidth *= ghostMultiplier;
                        }
                        const lineJoin = DrawerCanvas.getStreamDrawerProp(shape, 'lineJoin', propArguments);
                        const lineCap = DrawerCanvas.getStreamDrawerProp(shape, 'lineCap', propArguments);
                        const lineDash = DrawerCanvas.getStreamDrawerProp(shape, 'lineDash', propArguments);
                        const lineDashOffset = DrawerCanvas.getStreamDrawerProp(shape, 'lineDashOffset', propArguments);
                        const miterLimit = DrawerCanvas.getStreamDrawerProp(shape, 'miterLimit', propArguments);
                        context.setLineDash.call(context, lineDash || []);
                        context.lineJoin = lineJoin;
                        context.lineCap = lineCap;
                        context.lineDashOffset = lineDashOffset;
                        context.miterLimit = miterLimit;
                        context.lineWidth = lineWidth * sceneFit.scale;
                        context.strokeStyle = stroke;
                        context.stroke();
                    }
                }
                context.restore();
            }
        }
    }
    /**
     * Return a drawer value
     *
     * @static
     * @template T
     * @param {ShapePrimitive<T>} shape
     * @param {keyof T} key
     * @param {IDrawerPropArguments} propArguments
     * @param {*} [defaultValue]
     * @returns {*}
     */
    static getStreamDrawerProp(shape, key, propArguments, defaultValue) {
        let attribute = shape.drawer[key];
        if (typeof attribute === 'function') {
            attribute = attribute(propArguments);
        }
        return attribute !== null && attribute !== void 0 ? attribute : defaultValue;
    }
    /**
     * Create color based on ghostMultiplier
     *
     * @static
     * @param {any} color
     * @param {number} ghostMultiplier
     * @return {*}  {(string | undefined)}
     */
    static ghostifyColor(color, ghostMultiplier) {
        if (typeof color === 'string' || typeof color === 'number') {
            const parsed = color_1.parseColor(color);
            if (parsed) {
                const ghostAlpha = parsed.alpha * ghostMultiplier;
                return parsed.type === 'rgb'
                    ? `rgba(${parsed.a},${parsed.b},${parsed.c},${ghostAlpha})`
                    : `hsla(${parsed.a},${parsed.b}%,${parsed.c}%,${ghostAlpha})`;
            }
        }
        return color;
    }
    /**
     * Clear canvas, draw background or image (and fit)
     *
     * @param context
     * @param width
     * @param height
     * @param background
     * @param backgroundImage
     * @param backgroundImageFit
     */
    static clear(context, width, height, background, backgroundImage, backgroundImageFit) {
        if (typeof background === 'boolean' && background === false) {
            context.clearRect(0, 0, width, height);
        }
        else {
            context.globalCompositeOperation = 'source-over';
            context.fillStyle = background; // or true
            context.fillRect(0, 0, width, height);
            if (backgroundImage) {
                const sourceWidth = backgroundImage instanceof SVGImageElement ? backgroundImage.width.baseVal.value : backgroundImage.width;
                const sourceHeight = backgroundImage instanceof SVGImageElement ? backgroundImage.height.baseVal.value : backgroundImage.height;
                const fitRect = utils_1.fit(sourceWidth, sourceHeight, width, height, backgroundImageFit);
                context.drawImage(backgroundImage, fitRect.x, fitRect.y, fitRect.width, fitRect.height);
            }
        }
    }
    /**
     * Draw utility lines
     *
     * @param context
     * @param simmetricLines
     * @param width
     * @param height
     * @param color
     */
    static drawSimmetricLines(context, simmetricLines, width, height, color) {
        const offset = Math.PI / simmetricLines;
        const size = Math.max(width, height);
        const sizeMin = Math.min(width, height);
        const k = width < height ? 1 : 0;
        const centerX = [size / 2, size / 2];
        const centerY = [sizeMin / 2, sizeMin / 2];
        for (let i = 0; i < simmetricLines; i++) {
            const a = [-size, -size];
            const b = [size * 2, size * 2];
            const rotate = i * offset + Math.PI / 4;
            Vec2_1.default.rotateZ(a, i % 2 === k ? centerX : centerY, rotate);
            Vec2_1.default.rotateZ(b, i % 2 === k ? centerX : centerY, rotate);
            context.beginPath();
            context.strokeStyle = color;
            context.lineWidth = 1;
            context.moveTo(a[0], a[1]);
            context.lineTo(b[0], b[1]);
            context.stroke();
        }
    }
}
exports.DrawerCanvas = DrawerCanvas;
// const sourceRatio = sourceWidth / sourceHeight
// let x = 0,
// 	y = 0,
// 	bgWidth = width,
// 	bgHeight = height
// if (sourceRatio !== ratio) {
// 	if (options.backgroundImageFit === 'contain') {
// 		bgWidth = ratio > sourceRatio ? (sourceWidth * height) / sourceHeight : width
// 		bgHeight = ratio > sourceRatio ? height : (sourceHeight * width) / sourceWidth
// 	} else {
// 		bgWidth = ratio < sourceRatio ? (sourceWidth * height) / sourceHeight : width
// 		bgHeight = ratio < sourceRatio ? height : (sourceHeight * width) / sourceWidth
// 	}
// 	x = (width - bgWidth) / 2
// 	y = (height - bgHeight) / 2
//# sourceMappingURL=DrawerCanvas.js.map

/***/ }),
/* 9 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(10), exports);
__exportStar(__webpack_require__(11), exports);
__exportStar(__webpack_require__(12), exports);
//# sourceMappingURL=index.js.map

/***/ }),
/* 10 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=types.js.map

/***/ }),
/* 11 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.rgbToHsl = exports.hslToRgb = exports.rgbToHex = void 0;
/**
 * Convert rgb to hex
 *
 * @param r number between 0 - 255
 * @param g number between 0 - 255
 * @param b number between 0 - 255
 * @returns #ffffff
 */
function rgbToHex(r, g, b) {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}
exports.rgbToHex = rgbToHex;
/**
 * Convert hsl (0-360, 0-100, 0-100) color to rgb(0-255, 0-255, 0-255)
 *
 * @param {number} h number between 0 - 360
 * @param {number} s number between 0 - 100
 * @param {number} l number between 0 - 100
 * @returns {[number, number, number]} [0-255, 0-255, 0-255]
 */
function hslToRgb(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;
    let r, g, b;
    if (s == 0) {
        r = g = b = l; // achromatic
    }
    else {
        const hue2rgb = (p, q, t) => {
            t += t < 0 ? 1 : t > 1 ? -1 : 0;
            if (t < 1 / 6)
                return p + (q - p) * 6 * t;
            if (t < 1 / 2)
                return q;
            if (t < 2 / 3)
                return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }
    return [(0.5 + r * 255) << 0, (0.5 + g * 255) << 0, (0.5 + b * 255) << 0];
}
exports.hslToRgb = hslToRgb;
/**
 * Convert rbg (0-255, 0-255, 0-255) to hsl (0-360, 0-100, 0-100)
 *
 * @param {number} r number between 0 - 255
 * @param {number} g number between 0 - 255
 * @param {number} b number between 0 - 255
 * @returns {[number, number, number]} (0-360, 0-100, 0-100)
 */
function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    let h, s;
    if (max === min) {
        h = s = 0;
    }
    else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h = h / 6;
    }
    return [(0.5 + h * 360) << 0, (0.5 + s * 100) << 0, (0.5 + l * 100) << 0];
}
exports.rgbToHsl = rgbToHsl;
//# sourceMappingURL=conversions.js.map

/***/ }),
/* 12 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.parseColor = exports.parseColorAndConvert = void 0;
const htmlcolors_1 = __webpack_require__(13);
const conversions_1 = __webpack_require__(11);
/**
 * Convert color to IConvertedColor
 * Supported format: 'hsla?' 'rgba?' 'hex{3,8}' number (0xFFFFFF[FF])
 * hsla format: hsla(360, 100%, 100%, 1)
 * rgba format: rgb(255, 255, 255, 1)
 *
 * @param {(string | number)} color
 * @returns {(IConvertedColor | undefined)}
 */
function parseColorAndConvert(color) {
    const parsed = parseColor(color);
    if (parsed) {
        if (parsed.type === 'hsl') {
            const [r, g, b] = conversions_1.hslToRgb(parsed.a, parsed.b, parsed.c);
            return {
                r,
                g,
                b,
                h: parsed.a,
                s: parsed.b,
                l: parsed.c,
                alpha: parsed.alpha,
            };
        }
        else {
            const [h, s, l] = conversions_1.rgbToHsl(parsed.a, parsed.b, parsed.c);
            return {
                h,
                s,
                l,
                r: parsed.a,
                g: parsed.b,
                b: parsed.c,
                alpha: parsed.alpha,
            };
        }
    }
}
exports.parseColorAndConvert = parseColorAndConvert;
/**
 * Convert color to IColor
 * Supported format: 'hsla?' 'rgba?' 'hex{3,8}' number (0xFFFFFF[FF])
 * hsla format: hsla(360, 100%, 100%, 1)
 * rgba format: rgb(255, 255, 255, 1)
 *
 * @param {(string | number)} color
 * @returns {(IColor | undefined)}
 */
function parseColor(color) {
    if (typeof color === 'number') {
        if (color > 0xffffff) {
            return {
                type: 'rgb',
                a: (color >> 24) & 255,
                b: (color >> 16) & 255,
                c: (color >> 8) & 255,
                alpha: (color & 255) / 255,
            };
        }
        else {
            return { type: 'rgb', a: (color >> 16) & 255, b: (color >> 8) & 255, c: color & 255, alpha: 1 };
        }
    }
    color = color.replace(/\s/g, '');
    if (htmlcolors_1.default[color])
        color = htmlcolors_1.default[color];
    let match = /^#([0-9a-f]{3,8})$/i.exec(color);
    if (match) {
        const hex = match[1];
        if (hex.length === 3) {
            return {
                type: 'rgb',
                a: parseInt(hex[0] + hex[0], 16),
                b: parseInt(hex[1] + hex[1], 16),
                c: parseInt(hex[2] + hex[2], 16),
                alpha: 1,
            };
        }
        else {
            return {
                type: 'rgb',
                a: parseInt(hex[0] + hex[1], 16),
                b: parseInt(hex[2] + hex[3], 16),
                c: parseInt(hex[4] + hex[5], 16),
                alpha: hex.length > 6 ? parseInt(hex.substring(6), 16) / 255 : 1,
            };
        }
    }
    match = /^((hsl|rgb)a?)\((\d+),(\d+)%?,(\d+)%?,?(.+)?\)$/i.exec(color);
    if (match) {
        const [, , type, a, b, c, alpha] = match;
        return {
            type: type,
            a: +a,
            b: +b,
            c: +c,
            alpha: alpha ? +alpha : 1,
        };
    }
}
exports.parseColor = parseColor;
//# sourceMappingURL=parsing.js.map

/***/ }),
/* 13 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const colors = {
    aliceblue: '#f0f8ff',
    antiquewhite: '#faebd7',
    aqua: '#00ffff',
    aquamarine: '#7fffd4',
    azure: '#f0ffff',
    beige: '#f5f5dc',
    bisque: '#ffe4c4',
    black: '#000000',
    blanchedalmond: '#ffebcd',
    blue: '#0000ff',
    blueviolet: '#8a2be2',
    brown: '#a52a2a',
    burlywood: '#deb887',
    cadetblue: '#5f9ea0',
    chartreuse: '#7fff00',
    chocolate: '#d2691e',
    coral: '#ff7f50',
    cornflowerblue: '#6495ed',
    cornsilk: '#fff8dc',
    crimson: '#dc143c',
    cyan: '#00ffff',
    darkblue: '#00008b',
    darkcyan: '#008b8b',
    darkgoldenrod: '#b8860b',
    darkgray: '#a9a9a9',
    darkgreen: '#006400',
    darkkhaki: '#bdb76b',
    darkmagenta: '#8b008b',
    darkolivegreen: '#556b2f',
    darkorange: '#ff8c00',
    darkorchid: '#9932cc',
    darkred: '#8b0000',
    darksalmon: '#e9967a',
    darkseagreen: '#8fbc8f',
    darkslateblue: '#483d8b',
    darkslategray: '#2f4f4f',
    darkturquoise: '#00ced1',
    darkviolet: '#9400d3',
    deeppink: '#ff1493',
    deepskyblue: '#00bfff',
    dimgray: '#696969',
    dodgerblue: '#1e90ff',
    firebrick: '#b22222',
    floralwhite: '#fffaf0',
    forestgreen: '#228b22',
    fuchsia: '#ff00ff',
    gainsboro: '#dcdcdc',
    ghostwhite: '#f8f8ff',
    gold: '#ffd700',
    goldenrod: '#daa520',
    gray: '#808080',
    green: '#008000',
    greenyellow: '#adff2f',
    honeydew: '#f0fff0',
    hotpink: '#ff69b4',
    indianred: '#cd5c5c',
    indigo: '#4b0082',
    ivory: '#fffff0',
    khaki: '#f0e68c',
    lavender: '#e6e6fa',
    lavenderblush: '#fff0f5',
    lawngreen: '#7cfc00',
    lemonchiffon: '#fffacd',
    lightblue: '#add8e6',
    lightcoral: '#f08080',
    lightcyan: '#e0ffff',
    lightgoldenrodyellow: '#fafad2',
    lightgrey: '#d3d3d3',
    lightgreen: '#90ee90',
    lightpink: '#ffb6c1',
    lightsalmon: '#ffa07a',
    lightseagreen: '#20b2aa',
    lightskyblue: '#87cefa',
    lightslategray: '#778899',
    lightsteelblue: '#b0c4de',
    lightyellow: '#ffffe0',
    lime: '#00ff00',
    limegreen: '#32cd32',
    linen: '#faf0e6',
    magenta: '#ff00ff',
    maroon: '#800000',
    mediumaquamarine: '#66cdaa',
    mediumblue: '#0000cd',
    mediumorchid: '#ba55d3',
    mediumpurple: '#9370d8',
    mediumseagreen: '#3cb371',
    mediumslateblue: '#7b68ee',
    mediumspringgreen: '#00fa9a',
    mediumturquoise: '#48d1cc',
    mediumvioletred: '#c71585',
    midnightblue: '#191970',
    mintcream: '#f5fffa',
    mistyrose: '#ffe4e1',
    moccasin: '#ffe4b5',
    navajowhite: '#ffdead',
    navy: '#000080',
    oldlace: '#fdf5e6',
    olive: '#808000',
    olivedrab: '#6b8e23',
    orange: '#ffa500',
    orangered: '#ff4500',
    orchid: '#da70d6',
    palegoldenrod: '#eee8aa',
    palegreen: '#98fb98',
    paleturquoise: '#afeeee',
    palevioletred: '#d87093',
    papayawhip: '#ffefd5',
    peachpuff: '#ffdab9',
    peru: '#cd853f',
    pink: '#ffc0cb',
    plum: '#dda0dd',
    powderblue: '#b0e0e6',
    purple: '#800080',
    rebeccapurple: '#663399',
    red: '#ff0000',
    rosybrown: '#bc8f8f',
    royalblue: '#4169e1',
    saddlebrown: '#8b4513',
    salmon: '#fa8072',
    sandybrown: '#f4a460',
    seagreen: '#2e8b57',
    seashell: '#fff5ee',
    sienna: '#a0522d',
    silver: '#c0c0c0',
    skyblue: '#87ceeb',
    slateblue: '#6a5acd',
    slategray: '#708090',
    snow: '#fffafa',
    springgreen: '#00ff7f',
    steelblue: '#4682b4',
    tan: '#d2b48c',
    teal: '#008080',
    thistle: '#d8bfd8',
    tomato: '#ff6347',
    turquoise: '#40e0d0',
    violet: '#ee82ee',
    wheat: '#f5deb3',
    white: '#ffffff',
    whitesmoke: '#f5f5f5',
    yellow: '#ffff00',
    yellowgreen: '#9acd32',
};
exports.default = colors;
//# sourceMappingURL=htmlcolors.js.map

/***/ }),
/* 14 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

/* globals document, ImageData */

const parseFont = __webpack_require__(15)

exports.parseFont = parseFont

exports.createCanvas = function (width, height) {
  return Object.assign(document.createElement('canvas'), { width: width, height: height })
}

exports.createImageData = function (array, width, height) {
  // Browser implementation of ImageData looks at the number of arguments passed
  switch (arguments.length) {
    case 0: return new ImageData()
    case 1: return new ImageData(array)
    case 2: return new ImageData(array, width)
    default: return new ImageData(array, width, height)
  }
}

exports.loadImage = function (src, options) {
  return new Promise(function (resolve, reject) {
    const image = Object.assign(document.createElement('img'), options)

    function cleanup () {
      image.onload = null
      image.onerror = null
    }

    image.onload = function () { cleanup(); resolve(image) }
    image.onerror = function () { cleanup(); reject(new Error('Failed to load the image "' + src + '"')) }

    image.src = src
  })
}


/***/ }),
/* 15 */
/***/ ((module) => {

"use strict";


/**
 * Font RegExp helpers.
 */

const weights = 'bold|bolder|lighter|[1-9]00'
  , styles = 'italic|oblique'
  , variants = 'small-caps'
  , stretches = 'ultra-condensed|extra-condensed|condensed|semi-condensed|semi-expanded|expanded|extra-expanded|ultra-expanded'
  , units = 'px|pt|pc|in|cm|mm|%|em|ex|ch|rem|q'
  , string = '\'([^\']+)\'|"([^"]+)"|[\\w\\s-]+'

// [ [ <‘font-style’> || <font-variant-css21> || <‘font-weight’> || <‘font-stretch’> ]?
//    <‘font-size’> [ / <‘line-height’> ]? <‘font-family’> ]
// https://drafts.csswg.org/css-fonts-3/#font-prop
const weightRe = new RegExp('(' + weights + ') +', 'i')
const styleRe = new RegExp('(' + styles + ') +', 'i')
const variantRe = new RegExp('(' + variants + ') +', 'i')
const stretchRe = new RegExp('(' + stretches + ') +', 'i')
const sizeFamilyRe = new RegExp(
  '([\\d\\.]+)(' + units + ') *'
  + '((?:' + string + ')( *, *(?:' + string + '))*)')

/**
 * Cache font parsing.
 */

const cache = {}

const defaultHeight = 16 // pt, common browser default

/**
 * Parse font `str`.
 *
 * @param {String} str
 * @return {Object} Parsed font. `size` is in device units. `unit` is the unit
 *   appearing in the input string.
 * @api private
 */

module.exports = function (str) {
  // Cached
  if (cache[str]) return cache[str]

  // Try for required properties first.
  const sizeFamily = sizeFamilyRe.exec(str)
  if (!sizeFamily) return // invalid

  // Default values and required properties
  const font = {
    weight: 'normal',
    style: 'normal',
    stretch: 'normal',
    variant: 'normal',
    size: parseFloat(sizeFamily[1]),
    unit: sizeFamily[2],
    family: sizeFamily[3].replace(/["']/g, '').replace(/ *, */g, ',')
  }

  // Optional, unordered properties.
  let weight, style, variant, stretch
  // Stop search at `sizeFamily.index`
  let substr = str.substring(0, sizeFamily.index)
  if ((weight = weightRe.exec(substr))) font.weight = weight[1]
  if ((style = styleRe.exec(substr))) font.style = style[1]
  if ((variant = variantRe.exec(substr))) font.variant = variant[1]
  if ((stretch = stretchRe.exec(substr))) font.stretch = stretch[1]

  // Convert to device units. (`font.unit` is the original unit)
  // TODO: ch, ex
  switch (font.unit) {
    case 'pt':
      font.size /= 0.75
      break
    case 'pc':
      font.size *= 16
      break
    case 'in':
      font.size *= 96
      break
    case 'cm':
      font.size *= 96.0 / 2.54
      break
    case 'mm':
      font.size *= 96.0 / 25.4
      break
    case '%':
      // TODO disabled because existing unit tests assume 100
      // font.size *= defaultHeight / 100 / 0.75
      break
    case 'em':
    case 'rem':
      font.size *= defaultHeight / 0.75
      break
    case 'q':
      font.size *= 96 / 25.4 / 4
      break
  }

  return (cache[str] = font)
}


/***/ }),
/* 16 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.fit = exports.bWorker = exports.bBrowser = exports.bNode = void 0;
exports.bNode = typeof process !== 'undefined' &&
    typeof process.versions !== 'undefined' &&
    typeof process.versions.node !== 'undefined';
exports.bBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';
exports.bWorker = typeof self === 'object' && ['ServiceWorkerGlobalScope', 'DedicatedWorkerGlobalScope'].includes(self.constructor.name);
/**
 * Utiltites
 *
 * @category Utilities
 * @export
 * @param {number} sourceWidth
 * @param {number} sourceHeight
 * @param {number} destWidth
 * @param {number} destHeight
 * @param {('cover' | 'contain' | 'none')} [fit='none']
 * @return {*}  {{ x: number; y: number; width: number; height: number; scale: number }}
 */
function fit(sourceWidth, sourceHeight, destWidth, destHeight, fit = 'none') {
    let x = 0, y = 0, scale = 1, finalWidth = sourceWidth, finalHeight = sourceHeight;
    const ratio = destWidth / destHeight;
    const sourceRatio = sourceWidth / sourceHeight;
    if (fit === 'contain') {
        finalWidth = ratio > sourceRatio ? (sourceWidth * destHeight) / sourceHeight : destWidth;
        finalHeight = ratio > sourceRatio ? destHeight : (sourceHeight * destWidth) / sourceWidth;
        scale = Math.max(finalWidth, finalHeight) / Math.max(sourceWidth, sourceHeight);
    }
    else if (fit === 'cover') {
        finalWidth = ratio < sourceRatio ? (sourceWidth * destHeight) / sourceHeight : destWidth;
        finalHeight = ratio < sourceRatio ? destHeight : (sourceHeight * destWidth) / sourceWidth;
        // scale = Math.min(sourceWidth, sourceHeight) / Math.min(finalWidth, finalHeight)
        scale = Math.max(finalWidth, finalHeight) / Math.max(sourceWidth, sourceHeight);
    }
    else {
        // finalWidth = sourceWidth
        // finalHeight = sourceHeight
    }
    x = (destWidth - finalWidth) / 2;
    y = (destHeight - finalHeight) / 2;
    return {
        x,
        y,
        width: finalWidth,
        height: finalHeight,
        scale,
    };
}
exports.fit = fit;
//# sourceMappingURL=utils.js.map

/***/ }),
/* 17 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Renderer = void 0;
const ffmpeg_1 = __webpack_require__(18);
const Utilities_1 = __webpack_require__(2);
const JSZip = __webpack_require__(31);
const browser_1 = __webpack_require__(0);
const Emitter_1 = __webpack_require__(7);
const utils_1 = __webpack_require__(16);
/**
 * The Renderer is a class for exporting the scene
 *
 * @category Renderer
 * @class Renderer
 * @extends {Emitter<IRendererEvents>}
 */
class Renderer extends Emitter_1.Emitter {
    constructor(drawer, ffmpegCorePath) {
        super();
        this.drawer = drawer;
        this.ffmpegCorePath =
            typeof ffmpegCorePath === 'undefined' && drawer instanceof browser_1.default
                ? 'https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js'
                : ffmpegCorePath;
    }
    /**
     * Render any frame and create array of zip
     *
     * @param imagesType
     * @param quality
     * @param framesForChunk
     * @returns
     */
    async zip(imagesType = 'image/png', quality = 1, framesForChunk = 600) {
        const startTime = Utilities_1.now();
        const zip = new JSZip();
        const totalFrames = this.drawer.timeline.getFramesCount();
        const chunks = Math.ceil(totalFrames / framesForChunk);
        this.dispatch('renderer:zip_start', { chunks, totalFrames, framesForChunk });
        const extension = imagesType === 'image/jpeg' ? '.jpg' : '.png';
        const zipParts = [];
        let totalRenderTime = 0;
        for (let chunk = 0, rendered = 1; chunk < chunks; chunk++) {
            for (let frameIndex = 0; frameIndex < framesForChunk; frameIndex++, rendered++) {
                const frame = frameIndex + chunk * framesForChunk;
                if (frame < totalFrames) {
                    const renderStartTime = Utilities_1.now();
                    const frameName = frame.toString().padStart(5, '0') + extension;
                    const blob = await this.frame(frame, imagesType, quality);
                    const buffer = (await (utils_1.bNode ? blob : blob.arrayBuffer()));
                    zip.file(frameName, new Uint8Array(buffer, 0, buffer.byteLength));
                    const currentTime = Utilities_1.now();
                    const renderTime = currentTime - renderStartTime;
                    totalRenderTime += renderTime;
                    this.dispatch('renderer:zip_progress', {
                        chunk: chunk + 1,
                        frame: frame + 1,
                        totalFrames,
                        framesForChunk,
                        totalChunks: chunks,
                        renderTime,
                        remainingTime: (totalFrames - rendered) * (totalRenderTime / rendered),
                        elapsedTime: currentTime - startTime,
                    });
                }
            }
            this.dispatch('renderer:zip_preparing');
            zipParts.push(await zip.generateAsync({ type: 'uint8array' }));
        }
        return zipParts;
    }
    /**
     * Render animation
     *
     * @param type render type
     * @param quality
     * @param ffmpegLogger
     * @param ffmpegProgress
     * @returns
     */
    async render(type = 'video/mp4', quality = 1, ffmpegLogger, ffmpegProgress) {
        const startTime = Utilities_1.now();
        const totalFrames = this.drawer.timeline.getFramesCount();
        const framerate = this.drawer.timeline.getFramerate();
        const duration = this.drawer.timeline.getDuration();
        this.dispatch('renderer:video_init', { totalFrames, framerate, duration, type });
        if (!this.ffmpeg) {
            const ffmpegOptions = {
                log: false,
            };
            if (this.ffmpegCorePath)
                ffmpegOptions.corePath = this.ffmpegCorePath;
            if (ffmpegLogger)
                ffmpegOptions.logger = ffmpegLogger;
            if (ffmpegProgress)
                ffmpegOptions.progress = ffmpegProgress;
            this.ffmpeg = ffmpeg_1.createFFmpeg(ffmpegOptions);
            await this.ffmpeg.load();
        }
        let totalRenderTime = 0;
        this.dispatch('renderer:video_start', { totalFrames, framerate, duration, type });
        for (let frame = 0; frame < totalFrames; frame++) {
            const renderStartTime = Utilities_1.now();
            const blob = await this.frame(frame, 'image/jpeg', quality);
            const buffer = (await (utils_1.bNode ? blob : blob.arrayBuffer()));
            const frameName = frame.toString().padStart(5, '0') + '.jpg';
            this.ffmpeg.FS('writeFile', frameName, new Uint8Array(buffer, 0, buffer.byteLength));
            const currentTime = Utilities_1.now();
            const renderTime = currentTime - renderStartTime;
            totalRenderTime += renderTime;
            this.dispatch('renderer:video_progress', {
                totalFrames,
                frame: frame + 1,
                renderTime,
                duration,
                remainingTime: (totalFrames - frame) * (totalRenderTime / (frame + 1)),
                elapsedTime: currentTime - startTime,
            });
        }
        const args = ['-r', framerate.toString(), '-i', '%05d.jpg'];
        let outExt = 'mp4';
        switch (type) {
            case 'video/webm':
                args.push('-c:v', 'libvpx');
                args.push('-row-mt', '1');
                args.push('-pix_fmt', 'yuv420p');
                outExt = 'webm';
                break;
            case 'video/mp4':
                args.push('-c:v', 'libx264');
                args.push('-pix_fmt', 'yuv420p');
                outExt = 'mp4';
                break;
            case 'gif':
                args.push('-loop', '0');
                outExt = 'gif';
                break;
        }
        const outName = 'out.' + outExt;
        args.push(outName);
        this.dispatch('renderer:video_preparing');
        await this.ffmpeg.run(...args);
        const result = await this.ffmpeg.FS('readFile', outName);
        return result;
    }
    /**
     * Render frame `frameNumber` to Blob or Buffer
     *
     * @param frameNumber frame to render
     * @param mime image type
     * @param options quality or options
     * @returns Promise of Blob for browser or Buffer for Node
     */
    frame(frameNumber, mime = 'image/png', options = 1) {
        if (!this.drawer.getOption('clear', true)) {
            for (let i = 0; i <= frameNumber; i++) {
                this.drawer.timeline.setFrame(i);
                this.drawer.draw();
            }
        }
        else {
            this.drawer.timeline.setFrame(frameNumber);
            this.drawer.draw();
        }
        return this.blobOrBuffer(mime, options);
    }
    /**
     * Render frame at time to Blob or Buffer
     *
     * @param time animation time
     * @param mime image type
     * @param options quality or options
     * @returns Promise of Blob for browser or Buffer for Node
     */
    frameAtTime(time, mime = 'image/png', options = 1) {
        return this.frame(this.drawer.timeline.getFrameAtTime(time), mime, options);
    }
    /**
     * Render frame number to DataUrl
     *
     * @param frameNumber frame to render
     * @param mime image type
     * @param options quality or options
     * @returns string image
     */
    frameToDataUrl(frameNumber, mime = 'image/png', options = 1) {
        if (!this.drawer.getOption('clear', true)) {
            for (let i = 0; i <= frameNumber; i++) {
                this.drawer.timeline.setFrame(i);
                this.drawer.draw();
            }
        }
        else {
            this.drawer.timeline.setFrame(frameNumber);
            this.drawer.draw();
        }
        return this.toDataUrl(mime, options);
    }
    /**
     * Render a frame at `time` to DataUrl
     *
     * @param time of animation
     * @param mime image type
     * @param options quality or options
     * @returns string image
     */
    frameAtTimeToDataUrl(time, mime = 'image/png', options = 1) {
        return this.frameToDataUrl(this.drawer.timeline.getFrameAtTime(time), mime, options);
    }
    /**
     * Canvas to DataURL
     *
     * @param mime
     * @param optionsOrQuality
     * @returns
     */
    toDataUrl(mime, optionsOrQuality = 1) {
        const canvas = this.drawer.getCanvas();
        if (canvas) {
            if (utils_1.bBrowser && canvas instanceof OffscreenCanvas) {
                console.warn('Cannot convert toDataURL in OffscreenCanvas');
            }
            else {
                return canvas.toDataURL(mime, optionsOrQuality);
            }
        }
        return null;
    }
    /**
     * Canvas to BoB
     *
     * @param mime
     * @param optionsOrQuality
     * @returns
     */
    blobOrBuffer(mime, optionsOrQuality = 1) {
        const canvas = this.drawer.getCanvas();
        if (canvas === null)
            throw new Error('Canvas not setted into Drawer');
        if (utils_1.bNode) {
            // TODO default node quality for jpeg and png
            switch (mime) {
                case 'image/png': {
                    const pngConf = typeof optionsOrQuality === 'number'
                        ? {
                            compressionLevel: (9 - Utilities_1.clamp(0, 1, optionsOrQuality) * 9),
                        }
                        : optionsOrQuality;
                    return Promise.resolve(canvas.toBuffer(mime, pngConf));
                }
                case 'image/jpeg': {
                    const jpegConf = typeof optionsOrQuality === 'number'
                        ? {
                            quality: optionsOrQuality,
                        }
                        : optionsOrQuality;
                    return Promise.resolve(canvas.toBuffer(mime, jpegConf));
                }
            }
        }
        if (canvas instanceof OffscreenCanvas) {
            return canvas.convertToBlob({ type: mime, quality: typeof optionsOrQuality === 'number' ? optionsOrQuality : 1 });
        }
        return new Promise(resolve => {
            ;
            canvas.toBlob(blob => {
                if (blob)
                    resolve(blob);
                else
                    throw new Error('Blob error');
            }, mime, typeof optionsOrQuality === 'number' ? optionsOrQuality : 1);
        });
    }
}
exports.Renderer = Renderer;
//# sourceMappingURL=Renderer.js.map

/***/ }),
/* 18 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

__webpack_require__(19);
const createFFmpeg = __webpack_require__(20);
const { fetchFile } = __webpack_require__(25);

module.exports = {
  /*
   * Create ffmpeg instance.
   * Each ffmpeg instance owns an isolated MEMFS and works
   * independently.
   *
   * For example:
   *
   * ```
   * const ffmpeg = createFFmpeg({
   *  log: true,
   *  logger: () => {},
   *  progress: () => {},
   *  corePath: '',
   * })
   * ```
   *
   * For the usage of these four arguments, check config.js
   *
   */
  createFFmpeg,
  /*
   * Helper function for fetching files from various resource.
   * Sometimes the video/audio file you want to process may located
   * in a remote URL and somewhere in your local file system.
   *
   * This helper function helps you to fetch to file and return an
   * Uint8Array variable for ffmpeg.wasm to consume.
   *
   */
  fetchFile,
};


/***/ }),
/* 19 */
/***/ ((module) => {

/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var runtime = (function (exports) {
  "use strict";

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  function define(obj, key, value) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
    return obj[key];
  }
  try {
    // IE 8 has a broken Object.defineProperty that only works on DOM objects.
    define({}, "");
  } catch (err) {
    define = function(obj, key, value) {
      return obj[key] = value;
    };
  }

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  exports.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.
  var IteratorPrototype = {};
  define(IteratorPrototype, iteratorSymbol, function () {
    return this;
  });

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  if (NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = GeneratorFunctionPrototype;
  define(Gp, "constructor", GeneratorFunctionPrototype);
  define(GeneratorFunctionPrototype, "constructor", GeneratorFunction);
  GeneratorFunction.displayName = define(
    GeneratorFunctionPrototype,
    toStringTagSymbol,
    "GeneratorFunction"
  );

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      define(prototype, method, function(arg) {
        return this._invoke(method, arg);
      });
    });
  }

  exports.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  exports.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      define(genFun, toStringTagSymbol, "GeneratorFunction");
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.
  exports.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator, PromiseImpl) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return PromiseImpl.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return PromiseImpl.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration.
          result.value = unwrapped;
          resolve(result);
        }, function(error) {
          // If a rejected Promise was yielded, throw the rejection back
          // into the async generator function so it can be handled there.
          return invoke("throw", error, resolve, reject);
        });
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new PromiseImpl(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);
  define(AsyncIterator.prototype, asyncIteratorSymbol, function () {
    return this;
  });
  exports.AsyncIterator = AsyncIterator;

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  exports.async = function(innerFn, outerFn, self, tryLocsList, PromiseImpl) {
    if (PromiseImpl === void 0) PromiseImpl = Promise;

    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList),
      PromiseImpl
    );

    return exports.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;

        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);

        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.
          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  }

  // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.
  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];
    if (method === undefined) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        // Note: ["return"] must be used for ES3 parsing compatibility.
        if (delegate.iterator["return"]) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError(
          "The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (! info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value;

      // Resume execution at the desired location (see delegateYield).
      context.next = delegate.nextLoc;

      // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.
      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined;
      }

    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    }

    // The delegate iterator is finished, so forget it and continue with
    // the outer generator.
    context.delegate = null;
    return ContinueSentinel;
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  define(Gp, toStringTagSymbol, "Generator");

  // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.
  define(Gp, iteratorSymbol, function() {
    return this;
  });

  define(Gp, "toString", function() {
    return "[object Generator]";
  });

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  exports.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  exports.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined;
      this.done = false;
      this.delegate = null;

      this.method = "next";
      this.arg = undefined;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined;
        }

        return !! caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined;
      }

      return ContinueSentinel;
    }
  };

  // Regardless of whether this script is executing as a CommonJS module
  // or not, return the runtime object so that we can declare the variable
  // regeneratorRuntime in the outer scope, which allows this module to be
  // injected easily by `bin/regenerator --include-runtime script.js`.
  return exports;

}(
  // If this script is executing as a CommonJS module, use module.exports
  // as the regeneratorRuntime namespace. Otherwise create a new empty
  // object. Either way, the resulting object will be used to initialize
  // the regeneratorRuntime variable at the top of this file.
   true ? module.exports : 0
));

try {
  regeneratorRuntime = runtime;
} catch (accidentalStrictMode) {
  // This module should not be running in strict mode, so the above
  // assignment should always work unless something is misconfigured. Just
  // in case runtime.js accidentally runs in strict mode, in modern engines
  // we can explicitly access globalThis. In older engines we can escape
  // strict mode using a global Function call. This could conceivably fail
  // if a Content Security Policy forbids using Function, but in that case
  // the proper solution is to fix the accidental strict mode problem. If
  // you've misconfigured your bundler to force strict mode and applied a
  // CSP to forbid Function, and you're not willing to fix either of those
  // problems, please detail your unique predicament in a GitHub issue.
  if (typeof globalThis === "object") {
    globalThis.regeneratorRuntime = runtime;
  } else {
    Function("r", "regeneratorRuntime = r")(runtime);
  }
}


/***/ }),
/* 20 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const { defaultArgs, baseOptions } = __webpack_require__(21);
const { setLogging, setCustomLogger, log } = __webpack_require__(22);
const parseProgress = __webpack_require__(23);
const parseArgs = __webpack_require__(24);
const { defaultOptions, getCreateFFmpegCore } = __webpack_require__(25);
const { version } = __webpack_require__(28);

const NO_LOAD = Error('ffmpeg.wasm is not ready, make sure you have completed load().');

module.exports = (_options = {}) => {
  const {
    log: logging,
    logger,
    progress: optProgress,
    ...options
  } = {
    ...baseOptions,
    ...defaultOptions,
    ..._options,
  };
  let Core = null;
  let ffmpeg = null;
  let runResolve = null;
  let running = false;
  let progress = optProgress;
  const detectCompletion = (message) => {
    if (message === 'FFMPEG_END' && runResolve !== null) {
      runResolve();
      runResolve = null;
      running = false;
    }
  };
  const parseMessage = ({ type, message }) => {
    log(type, message);
    parseProgress(message, progress);
    detectCompletion(message);
  };

  /*
   * Load ffmpeg.wasm-core script.
   * In browser environment, the ffmpeg.wasm-core script is fetch from
   * CDN and can be assign to a local path by assigning `corePath`.
   * In node environment, we use dynamic require and the default `corePath`
   * is `$ffmpeg/core`.
   *
   * Typically the load() func might take few seconds to minutes to complete,
   * better to do it as early as possible.
   *
   */
  const load = async () => {
    log('info', 'load ffmpeg-core');
    if (Core === null) {
      log('info', 'loading ffmpeg-core');
      /*
       * In node environment, all paths are undefined as there
       * is no need to set them.
       */
      const {
        createFFmpegCore,
        corePath,
        workerPath,
        wasmPath,
      } = await getCreateFFmpegCore(options);
      Core = await createFFmpegCore({
        /*
         * Assign mainScriptUrlOrBlob fixes chrome extension web worker issue
         * as there is no document.currentScript in the context of content_scripts
         */
        mainScriptUrlOrBlob: corePath,
        printErr: (message) => parseMessage({ type: 'fferr', message }),
        print: (message) => parseMessage({ type: 'ffout', message }),
        /*
         * locateFile overrides paths of files that is loaded by main script (ffmpeg-core.js).
         * It is critical for browser environment and we override both wasm and worker paths
         * as we are using blob URL instead of original URL to avoid cross origin issues.
         */
        locateFile: (path, prefix) => {
          if (typeof window !== 'undefined') {
            if (typeof wasmPath !== 'undefined'
              && path.endsWith('ffmpeg-core.wasm')) {
              return wasmPath;
            }
            if (typeof workerPath !== 'undefined'
              && path.endsWith('ffmpeg-core.worker.js')) {
              return workerPath;
            }
          }
          return prefix + path;
        },
      });
      ffmpeg = Core.cwrap('proxy_main', 'number', ['number', 'number']);
      log('info', 'ffmpeg-core loaded');
    } else {
      throw Error('ffmpeg.wasm was loaded, you should not load it again, use ffmpeg.isLoaded() to check next time.');
    }
  };

  /*
   * Determine whether the Core is loaded.
   */
  const isLoaded = () => Core !== null;

  /*
   * Run ffmpeg command.
   * This is the major function in ffmpeg.wasm, you can just imagine it
   * as ffmpeg native cli and what you need to pass is the same.
   *
   * For example, you can convert native command below:
   *
   * ```
   * $ ffmpeg -i video.avi -c:v libx264 video.mp4
   * ```
   *
   * To
   *
   * ```
   * await ffmpeg.run('-i', 'video.avi', '-c:v', 'libx264', 'video.mp4');
   * ```
   *
   */
  const run = (..._args) => {
    log('info', `run ffmpeg command: ${_args.join(' ')}`);
    if (Core === null) {
      throw NO_LOAD;
    } else if (running) {
      throw Error('ffmpeg.wasm can only run one command at a time');
    } else {
      running = true;
      return new Promise((resolve) => {
        const args = [...defaultArgs, ..._args].filter((s) => s.length !== 0);
        runResolve = resolve;
        ffmpeg(...parseArgs(Core, args));
      });
    }
  };

  /*
   * Run FS operations.
   * For input/output file of ffmpeg.wasm, it is required to save them to MEMFS
   * first so that ffmpeg.wasm is able to consume them. Here we rely on the FS
   * methods provided by Emscripten.
   *
   * Common methods to use are:
   * ffmpeg.FS('writeFile', 'video.avi', new Uint8Array(...)): writeFile writes
   * data to MEMFS. You need to use Uint8Array for binary data.
   * ffmpeg.FS('readFile', 'video.mp4'): readFile from MEMFS.
   * ffmpeg.FS('unlink', 'video.map'): delete file from MEMFS.
   *
   * For more info, check https://emscripten.org/docs/api_reference/Filesystem-API.html
   *
   */
  const FS = (method, ...args) => {
    log('info', `run FS.${method} ${args.map((arg) => (typeof arg === 'string' ? arg : `<${arg.length} bytes binary file>`)).join(' ')}`);
    if (Core === null) {
      throw NO_LOAD;
    } else {
      let ret = null;
      try {
        ret = Core.FS[method](...args);
      } catch (e) {
        if (method === 'readdir') {
          throw Error(`ffmpeg.FS('readdir', '${args[0]}') error. Check if the path exists, ex: ffmpeg.FS('readdir', '/')`);
        } else if (method === 'readFile') {
          throw Error(`ffmpeg.FS('readFile', '${args[0]}') error. Check if the path exists`);
        } else {
          throw Error('Oops, something went wrong in FS operation.');
        }
      }
      return ret;
    }
  };

  /**
   * forcibly terminate the ffmpeg program.
   */
  const exit = () => {
    if (Core === null) {
      throw NO_LOAD;
    } else {
      running = false;
      Core.exit(1);
      Core = null;
      ffmpeg = null;
      runResolve = null;
    }
  };

  const setProgress = (_progress) => {
    progress = _progress;
  };

  const setLogger = (_logger) => {
    setCustomLogger(_logger);
  };

  setLogging(logging);
  setCustomLogger(logger);

  log('info', `use ffmpeg.wasm v${version}`);

  return {
    setProgress,
    setLogger,
    setLogging,
    load,
    isLoaded,
    run,
    exit,
    FS,
  };
};


/***/ }),
/* 21 */
/***/ ((module) => {

module.exports = {
  defaultArgs: [
    /* args[0] is always the binary path */
    './ffmpeg',
    /* Disable interaction mode */
    '-nostdin',
    /* Force to override output file */
    '-y',
  ],
  baseOptions: {
    /* Flag to turn on/off log messages in console */
    log: false,
    /*
     * Custom logger to get ffmpeg.wasm output messages.
     * a sample logger looks like this:
     *
     * ```
     * logger = ({ type, message }) => {
     *   console.log(type, message);
     * }
     * ```
     *
     * type can be one of following:
     *
     * info: internal workflow debug messages
     * fferr: ffmpeg native stderr output
     * ffout: ffmpeg native stdout output
     */
    logger: () => {},
    /*
     * Progress handler to get current progress of ffmpeg command.
     * a sample progress handler looks like this:
     *
     * ```
     * progress = ({ ratio }) => {
     *   console.log(ratio);
     * }
     * ```
     *
     * ratio is a float number between 0 to 1.
     */
    progress: () => {},
    /*
     * Path to find/download ffmpeg.wasm-core,
     * this value should be overwriten by `defaultOptions` in
     * each environment.
     */
    corePath: '',
  },
};


/***/ }),
/* 22 */
/***/ ((module) => {

let logging = false;
let customLogger = () => {};

const setLogging = (_logging) => {
  logging = _logging;
};

const setCustomLogger = (logger) => {
  customLogger = logger;
};

const log = (type, message) => {
  customLogger({ type, message });
  if (logging) {
    console.log(`[${type}] ${message}`);
  }
};

module.exports = {
  logging,
  setLogging,
  setCustomLogger,
  log,
};


/***/ }),
/* 23 */
/***/ ((module) => {

let duration = 0;
let ratio = 0;

const ts2sec = (ts) => {
  const [h, m, s] = ts.split(':');
  return (parseFloat(h) * 60 * 60) + (parseFloat(m) * 60) + parseFloat(s);
};

module.exports = (message, progress) => {
  if (typeof message === 'string') {
    if (message.startsWith('  Duration')) {
      const ts = message.split(', ')[0].split(': ')[1];
      const d = ts2sec(ts);
      progress({ duration: d, ratio });
      if (duration === 0 || duration > d) {
        duration = d;
      }
    } else if (message.startsWith('frame') || message.startsWith('size')) {
      const ts = message.split('time=')[1].split(' ')[0];
      const t = ts2sec(ts);
      ratio = t / duration;
      progress({ ratio, time: t });
    } else if (message.startsWith('video:')) {
      progress({ ratio: 1 });
      duration = 0;
    }
  }
};


/***/ }),
/* 24 */
/***/ ((module) => {

module.exports = (Core, args) => {
  const argsPtr = Core._malloc(args.length * Uint32Array.BYTES_PER_ELEMENT);
  args.forEach((s, idx) => {
    const buf = Core._malloc(s.length + 1);
    Core.writeAsciiToMemory(s, buf);
    Core.setValue(argsPtr + (Uint32Array.BYTES_PER_ELEMENT * idx), buf, 'i32');
  });
  return [args.length, argsPtr];
};


/***/ }),
/* 25 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const defaultOptions = __webpack_require__(26);
const getCreateFFmpegCore = __webpack_require__(29);
const fetchFile = __webpack_require__(30);

module.exports = {
  defaultOptions,
  getCreateFFmpegCore,
  fetchFile,
};


/***/ }),
/* 26 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const resolveURL = __webpack_require__(27);
const { devDependencies } = __webpack_require__(28);

/*
 * Default options for browser environment
 */
module.exports = {
  corePath:  true
    ? resolveURL('/node_modules/@ffmpeg/core/dist/ffmpeg-core.js')
    : 0,
};


/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;// Copyright 2014 Simon Lydell
// X11 (“MIT”) Licensed. (See LICENSE.)

void (function(root, factory) {
  if (true) {
    !(__WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
		__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
		(__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) :
		__WEBPACK_AMD_DEFINE_FACTORY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__))
  } else {}
}(this, function() {

  function resolveUrl(/* ...urls */) {
    var numUrls = arguments.length

    if (numUrls === 0) {
      throw new Error("resolveUrl requires at least one argument; got none.")
    }

    var base = document.createElement("base")
    base.href = arguments[0]

    if (numUrls === 1) {
      return base.href
    }

    var head = document.getElementsByTagName("head")[0]
    head.insertBefore(base, head.firstChild)

    var a = document.createElement("a")
    var resolved

    for (var index = 1; index < numUrls; index++) {
      a.href = arguments[index]
      resolved = a.href
      base.href = resolved
    }

    head.removeChild(base)

    return resolved
  }

  return resolveUrl

}));


/***/ }),
/* 28 */
/***/ ((module) => {

"use strict";
module.exports = JSON.parse('{"name":"@ffmpeg/ffmpeg","version":"0.10.1","description":"FFmpeg WebAssembly version","main":"src/index.js","types":"src/index.d.ts","directories":{"example":"examples"},"scripts":{"start":"node scripts/server.js","build":"rimraf dist && webpack --config scripts/webpack.config.prod.js","prepublishOnly":"npm run build","lint":"eslint src","wait":"rimraf dist && wait-on http://localhost:3000/dist/ffmpeg.dev.js","test":"npm-run-all -p -r start test:all","test:all":"npm-run-all wait test:browser:ffmpeg test:node:all","test:node":"node --experimental-wasm-threads --experimental-wasm-bulk-memory node_modules/.bin/_mocha --exit --bail --require ./scripts/test-helper.js","test:node:all":"npm run test:node -- ./tests/*.test.js","test:browser":"mocha-headless-chrome -a allow-file-access-from-files -a incognito -a no-sandbox -a disable-setuid-sandbox -a disable-logging -t 300000","test:browser:ffmpeg":"npm run test:browser -- -f ./tests/ffmpeg.test.html"},"browser":{"./src/node/index.js":"./src/browser/index.js"},"repository":{"type":"git","url":"git+https://github.com/ffmpegwasm/ffmpeg.wasm.git"},"keywords":["ffmpeg","WebAssembly","video"],"author":"Jerome Wu <jeromewus@gmail.com>","license":"MIT","bugs":{"url":"https://github.com/ffmpegwasm/ffmpeg.wasm/issues"},"engines":{"node":">=12.16.1"},"homepage":"https://github.com/ffmpegwasm/ffmpeg.wasm#readme","dependencies":{"is-url":"^1.2.4","node-fetch":"^2.6.1","regenerator-runtime":"^0.13.7","resolve-url":"^0.2.1"},"devDependencies":{"@babel/core":"^7.12.3","@babel/preset-env":"^7.12.1","@ffmpeg/core":"^0.10.0","@types/emscripten":"^1.39.4","babel-loader":"^8.1.0","chai":"^4.2.0","cors":"^2.8.5","eslint":"^7.12.1","eslint-config-airbnb-base":"^14.1.0","eslint-plugin-import":"^2.22.1","express":"^4.17.1","mocha":"^8.2.1","mocha-headless-chrome":"^2.0.3","npm-run-all":"^4.1.5","wait-on":"^5.3.0","webpack":"^5.3.2","webpack-cli":"^4.1.0","webpack-dev-middleware":"^4.0.0"}}');

/***/ }),
/* 29 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/* eslint-disable no-undef */
const resolveURL = __webpack_require__(27);
const { log } = __webpack_require__(22);

/*
 * Fetch data from remote URL and convert to blob URL
 * to avoid CORS issue
 */
const toBlobURL = async (url, mimeType) => {
  log('info', `fetch ${url}`);
  const buf = await (await fetch(url)).arrayBuffer();
  log('info', `${url} file size = ${buf.byteLength} bytes`);
  const blob = new Blob([buf], { type: mimeType });
  const blobURL = URL.createObjectURL(blob);
  log('info', `${url} blob URL = ${blobURL}`);
  return blobURL;
};

module.exports = async ({ corePath: _corePath }) => {
  if (typeof _corePath !== 'string') {
    throw Error('corePath should be a string!');
  }
  const coreRemotePath = resolveURL(_corePath);
  const corePath = await toBlobURL(
    coreRemotePath,
    'application/javascript',
  );
  const wasmPath = await toBlobURL(
    coreRemotePath.replace('ffmpeg-core.js', 'ffmpeg-core.wasm'),
    'application/wasm',
  );
  const workerPath = await toBlobURL(
    coreRemotePath.replace('ffmpeg-core.js', 'ffmpeg-core.worker.js'),
    'application/javascript',
  );
  if (typeof createFFmpegCore === 'undefined') {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      const eventHandler = () => {
        script.removeEventListener('load', eventHandler);
        log('info', 'ffmpeg-core.js script loaded');
        resolve({
          createFFmpegCore,
          corePath,
          wasmPath,
          workerPath,
        });
      };
      script.src = corePath;
      script.type = 'text/javascript';
      script.addEventListener('load', eventHandler);
      document.getElementsByTagName('head')[0].appendChild(script);
    });
  }
  log('info', 'ffmpeg-core.js script is loaded already');
  return Promise.resolve({
    createFFmpegCore,
    corePath,
    wasmPath,
    workerPath,
  });
};


/***/ }),
/* 30 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const resolveURL = __webpack_require__(27);

const readFromBlobOrFile = (blob) => (
  new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = () => {
      resolve(fileReader.result);
    };
    fileReader.onerror = ({ target: { error: { code } } }) => {
      reject(Error(`File could not be read! Code=${code}`));
    };
    fileReader.readAsArrayBuffer(blob);
  })
);

module.exports = async (_data) => {
  let data = _data;
  if (typeof _data === 'undefined') {
    return new Uint8Array();
  }

  if (typeof _data === 'string') {
    /* From base64 format */
    if (/data:_data\/([a-zA-Z]*);base64,([^"]*)/.test(_data)) {
      data = atob(_data.split(',')[1])
        .split('')
        .map((c) => c.charCodeAt(0));
    /* From remote server/URL */
    } else {
      const res = await fetch(resolveURL(_data));
      data = await res.arrayBuffer();
    }
  /* From Blob or File */
  } else if (_data instanceof File || _data instanceof Blob) {
    data = await readFromBlobOrFile(_data);
  }

  return new Uint8Array(data);
};


/***/ }),
/* 31 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/*!

JSZip v3.7.0 - A JavaScript class for generating and reading zip files
<http://stuartk.com/jszip>

(c) 2009-2016 Stuart Knightley <stuart [at] stuartk.com>
Dual licenced under the MIT license or GPLv3. See https://raw.github.com/Stuk/jszip/master/LICENSE.markdown.

JSZip uses the library pako released under the MIT license :
https://github.com/nodeca/pako/blob/master/LICENSE
*/

!function(e){if(true)module.exports=e();else {}}(function(){return function s(o,a,f){function u(r,e){if(!a[r]){if(!o[r]){var t=undefined;if(!e&&t)return require(r,!0);if(d)return d(r,!0);var n=new Error("Cannot find module '"+r+"'");throw n.code="MODULE_NOT_FOUND",n}var i=a[r]={exports:{}};o[r][0].call(i.exports,function(e){var t=o[r][1][e];return u(t||e)},i,i.exports,s,o,a,f)}return a[r].exports}for(var d=undefined,e=0;e<f.length;e++)u(f[e]);return u}({1:[function(h,t,n){(function(r){!function(e){"object"==typeof n&&void 0!==t?t.exports=e():("undefined"!=typeof window?window:void 0!==r?r:"undefined"!=typeof self?self:this).JSZip=e()}(function(){return function s(o,a,f){function u(t,e){if(!a[t]){if(!o[t]){var r="function"==typeof h&&h;if(!e&&r)return r(t,!0);if(d)return d(t,!0);var n=new Error("Cannot find module '"+t+"'");throw n.code="MODULE_NOT_FOUND",n}var i=a[t]={exports:{}};o[t][0].call(i.exports,function(e){return u(o[t][1][e]||e)},i,i.exports,s,o,a,f)}return a[t].exports}for(var d="function"==typeof h&&h,e=0;e<f.length;e++)u(f[e]);return u}({1:[function(h,t,n){(function(r){!function(e){"object"==typeof n&&void 0!==t?t.exports=e():("undefined"!=typeof window?window:void 0!==r?r:"undefined"!=typeof self?self:this).JSZip=e()}(function(){return function s(o,a,f){function u(t,e){if(!a[t]){if(!o[t]){var r="function"==typeof h&&h;if(!e&&r)return r(t,!0);if(d)return d(t,!0);var n=new Error("Cannot find module '"+t+"'");throw n.code="MODULE_NOT_FOUND",n}var i=a[t]={exports:{}};o[t][0].call(i.exports,function(e){return u(o[t][1][e]||e)},i,i.exports,s,o,a,f)}return a[t].exports}for(var d="function"==typeof h&&h,e=0;e<f.length;e++)u(f[e]);return u}({1:[function(h,t,n){(function(r){!function(e){"object"==typeof n&&void 0!==t?t.exports=e():("undefined"!=typeof window?window:void 0!==r?r:"undefined"!=typeof self?self:this).JSZip=e()}(function(){return function s(o,a,f){function u(t,e){if(!a[t]){if(!o[t]){var r="function"==typeof h&&h;if(!e&&r)return r(t,!0);if(d)return d(t,!0);var n=new Error("Cannot find module '"+t+"'");throw n.code="MODULE_NOT_FOUND",n}var i=a[t]={exports:{}};o[t][0].call(i.exports,function(e){return u(o[t][1][e]||e)},i,i.exports,s,o,a,f)}return a[t].exports}for(var d="function"==typeof h&&h,e=0;e<f.length;e++)u(f[e]);return u}({1:[function(h,t,n){(function(r){!function(e){"object"==typeof n&&void 0!==t?t.exports=e():("undefined"!=typeof window?window:void 0!==r?r:"undefined"!=typeof self?self:this).JSZip=e()}(function(){return function s(o,a,f){function u(t,e){if(!a[t]){if(!o[t]){var r="function"==typeof h&&h;if(!e&&r)return r(t,!0);if(d)return d(t,!0);var n=new Error("Cannot find module '"+t+"'");throw n.code="MODULE_NOT_FOUND",n}var i=a[t]={exports:{}};o[t][0].call(i.exports,function(e){return u(o[t][1][e]||e)},i,i.exports,s,o,a,f)}return a[t].exports}for(var d="function"==typeof h&&h,e=0;e<f.length;e++)u(f[e]);return u}({1:[function(h,t,n){(function(r){!function(e){"object"==typeof n&&void 0!==t?t.exports=e():("undefined"!=typeof window?window:void 0!==r?r:"undefined"!=typeof self?self:this).JSZip=e()}(function(){return function s(o,a,f){function u(t,e){if(!a[t]){if(!o[t]){var r="function"==typeof h&&h;if(!e&&r)return r(t,!0);if(d)return d(t,!0);var n=new Error("Cannot find module '"+t+"'");throw n.code="MODULE_NOT_FOUND",n}var i=a[t]={exports:{}};o[t][0].call(i.exports,function(e){return u(o[t][1][e]||e)},i,i.exports,s,o,a,f)}return a[t].exports}for(var d="function"==typeof h&&h,e=0;e<f.length;e++)u(f[e]);return u}({1:[function(h,t,n){(function(r){!function(e){"object"==typeof n&&void 0!==t?t.exports=e():("undefined"!=typeof window?window:void 0!==r?r:"undefined"!=typeof self?self:this).JSZip=e()}(function(){return function s(o,a,f){function u(t,e){if(!a[t]){if(!o[t]){var r="function"==typeof h&&h;if(!e&&r)return r(t,!0);if(d)return d(t,!0);var n=new Error("Cannot find module '"+t+"'");throw n.code="MODULE_NOT_FOUND",n}var i=a[t]={exports:{}};o[t][0].call(i.exports,function(e){return u(o[t][1][e]||e)},i,i.exports,s,o,a,f)}return a[t].exports}for(var d="function"==typeof h&&h,e=0;e<f.length;e++)u(f[e]);return u}({1:[function(h,t,n){(function(r){!function(e){"object"==typeof n&&void 0!==t?t.exports=e():("undefined"!=typeof window?window:void 0!==r?r:"undefined"!=typeof self?self:this).JSZip=e()}(function(){return function s(o,a,f){function u(t,e){if(!a[t]){if(!o[t]){var r="function"==typeof h&&h;if(!e&&r)return r(t,!0);if(d)return d(t,!0);var n=new Error("Cannot find module '"+t+"'");throw n.code="MODULE_NOT_FOUND",n}var i=a[t]={exports:{}};o[t][0].call(i.exports,function(e){return u(o[t][1][e]||e)},i,i.exports,s,o,a,f)}return a[t].exports}for(var d="function"==typeof h&&h,e=0;e<f.length;e++)u(f[e]);return u}({1:[function(h,t,n){(function(r){!function(e){"object"==typeof n&&void 0!==t?t.exports=e():("undefined"!=typeof window?window:void 0!==r?r:"undefined"!=typeof self?self:this).JSZip=e()}(function(){return function s(o,a,f){function u(t,e){if(!a[t]){if(!o[t]){var r="function"==typeof h&&h;if(!e&&r)return r(t,!0);if(d)return d(t,!0);var n=new Error("Cannot find module '"+t+"'");throw n.code="MODULE_NOT_FOUND",n}var i=a[t]={exports:{}};o[t][0].call(i.exports,function(e){return u(o[t][1][e]||e)},i,i.exports,s,o,a,f)}return a[t].exports}for(var d="function"==typeof h&&h,e=0;e<f.length;e++)u(f[e]);return u}({1:[function(h,t,n){(function(r){!function(e){"object"==typeof n&&void 0!==t?t.exports=e():("undefined"!=typeof window?window:void 0!==r?r:"undefined"!=typeof self?self:this).JSZip=e()}(function(){return function s(o,a,f){function u(t,e){if(!a[t]){if(!o[t]){var r="function"==typeof h&&h;if(!e&&r)return r(t,!0);if(d)return d(t,!0);var n=new Error("Cannot find module '"+t+"'");throw n.code="MODULE_NOT_FOUND",n}var i=a[t]={exports:{}};o[t][0].call(i.exports,function(e){return u(o[t][1][e]||e)},i,i.exports,s,o,a,f)}return a[t].exports}for(var d="function"==typeof h&&h,e=0;e<f.length;e++)u(f[e]);return u}({1:[function(h,t,n){(function(r){!function(e){"object"==typeof n&&void 0!==t?t.exports=e():("undefined"!=typeof window?window:void 0!==r?r:"undefined"!=typeof self?self:this).JSZip=e()}(function(){return function s(o,a,f){function u(t,e){if(!a[t]){if(!o[t]){var r="function"==typeof h&&h;if(!e&&r)return r(t,!0);if(d)return d(t,!0);var n=new Error("Cannot find module '"+t+"'");throw n.code="MODULE_NOT_FOUND",n}var i=a[t]={exports:{}};o[t][0].call(i.exports,function(e){return u(o[t][1][e]||e)},i,i.exports,s,o,a,f)}return a[t].exports}for(var d="function"==typeof h&&h,e=0;e<f.length;e++)u(f[e]);return u}({1:[function(h,t,n){(function(r){!function(e){"object"==typeof n&&void 0!==t?t.exports=e():("undefined"!=typeof window?window:void 0!==r?r:"undefined"!=typeof self?self:this).JSZip=e()}(function(){return function s(o,a,f){function u(t,e){if(!a[t]){if(!o[t]){var r="function"==typeof h&&h;if(!e&&r)return r(t,!0);if(d)return d(t,!0);var n=new Error("Cannot find module '"+t+"'");throw n.code="MODULE_NOT_FOUND",n}var i=a[t]={exports:{}};o[t][0].call(i.exports,function(e){return u(o[t][1][e]||e)},i,i.exports,s,o,a,f)}return a[t].exports}for(var d="function"==typeof h&&h,e=0;e<f.length;e++)u(f[e]);return u}({1:[function(h,t,n){(function(r){!function(e){"object"==typeof n&&void 0!==t?t.exports=e():("undefined"!=typeof window?window:void 0!==r?r:"undefined"!=typeof self?self:this).JSZip=e()}(function(){return function s(o,a,f){function u(t,e){if(!a[t]){if(!o[t]){var r="function"==typeof h&&h;if(!e&&r)return r(t,!0);if(d)return d(t,!0);var n=new Error("Cannot find module '"+t+"'");throw n.code="MODULE_NOT_FOUND",n}var i=a[t]={exports:{}};o[t][0].call(i.exports,function(e){return u(o[t][1][e]||e)},i,i.exports,s,o,a,f)}return a[t].exports}for(var d="function"==typeof h&&h,e=0;e<f.length;e++)u(f[e]);return u}({1:[function(h,t,n){(function(r){!function(e){"object"==typeof n&&void 0!==t?t.exports=e():("undefined"!=typeof window?window:void 0!==r?r:"undefined"!=typeof self?self:this).JSZip=e()}(function(){return function s(o,a,f){function u(t,e){if(!a[t]){if(!o[t]){var r="function"==typeof h&&h;if(!e&&r)return r(t,!0);if(d)return d(t,!0);var n=new Error("Cannot find module '"+t+"'");throw n.code="MODULE_NOT_FOUND",n}var i=a[t]={exports:{}};o[t][0].call(i.exports,function(e){return u(o[t][1][e]||e)},i,i.exports,s,o,a,f)}return a[t].exports}for(var d="function"==typeof h&&h,e=0;e<f.length;e++)u(f[e]);return u}({1:[function(h,t,n){(function(r){!function(e){"object"==typeof n&&void 0!==t?t.exports=e():("undefined"!=typeof window?window:void 0!==r?r:"undefined"!=typeof self?self:this).JSZip=e()}(function(){return function s(o,a,f){function u(t,e){if(!a[t]){if(!o[t]){var r="function"==typeof h&&h;if(!e&&r)return r(t,!0);if(d)return d(t,!0);var n=new Error("Cannot find module '"+t+"'");throw n.code="MODULE_NOT_FOUND",n}var i=a[t]={exports:{}};o[t][0].call(i.exports,function(e){return u(o[t][1][e]||e)},i,i.exports,s,o,a,f)}return a[t].exports}for(var d="function"==typeof h&&h,e=0;e<f.length;e++)u(f[e]);return u}({1:[function(h,t,n){(function(r){!function(e){"object"==typeof n&&void 0!==t?t.exports=e():("undefined"!=typeof window?window:void 0!==r?r:"undefined"!=typeof self?self:this).JSZip=e()}(function(){return function s(o,a,f){function u(t,e){if(!a[t]){if(!o[t]){var r="function"==typeof h&&h;if(!e&&r)return r(t,!0);if(d)return d(t,!0);var n=new Error("Cannot find module '"+t+"'");throw n.code="MODULE_NOT_FOUND",n}var i=a[t]={exports:{}};o[t][0].call(i.exports,function(e){return u(o[t][1][e]||e)},i,i.exports,s,o,a,f)}return a[t].exports}for(var d="function"==typeof h&&h,e=0;e<f.length;e++)u(f[e]);return u}({1:[function(h,t,n){(function(r){!function(e){"object"==typeof n&&void 0!==t?t.exports=e():("undefined"!=typeof window?window:void 0!==r?r:"undefined"!=typeof self?self:this).JSZip=e()}(function(){return function s(o,a,f){function u(t,e){if(!a[t]){if(!o[t]){var r="function"==typeof h&&h;if(!e&&r)return r(t,!0);if(d)return d(t,!0);var n=new Error("Cannot find module '"+t+"'");throw n.code="MODULE_NOT_FOUND",n}var i=a[t]={exports:{}};o[t][0].call(i.exports,function(e){return u(o[t][1][e]||e)},i,i.exports,s,o,a,f)}return a[t].exports}for(var d="function"==typeof h&&h,e=0;e<f.length;e++)u(f[e]);return u}({1:[function(h,t,n){(function(r){!function(e){"object"==typeof n&&void 0!==t?t.exports=e():("undefined"!=typeof window?window:void 0!==r?r:"undefined"!=typeof self?self:this).JSZip=e()}(function(){return function s(o,a,f){function u(t,e){if(!a[t]){if(!o[t]){var r="function"==typeof h&&h;if(!e&&r)return r(t,!0);if(d)return d(t,!0);var n=new Error("Cannot find module '"+t+"'");throw n.code="MODULE_NOT_FOUND",n}var i=a[t]={exports:{}};o[t][0].call(i.exports,function(e){return u(o[t][1][e]||e)},i,i.exports,s,o,a,f)}return a[t].exports}for(var d="function"==typeof h&&h,e=0;e<f.length;e++)u(f[e]);return u}({1:[function(e,t,r){"use strict";var c=e("./utils"),h=e("./support"),p="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";r.encode=function(e){for(var t,r,n,i,s,o,a,f=[],u=0,d=e.length,h=d,l="string"!==c.getTypeOf(e);u<e.length;)h=d-u,n=l?(t=e[u++],r=u<d?e[u++]:0,u<d?e[u++]:0):(t=e.charCodeAt(u++),r=u<d?e.charCodeAt(u++):0,u<d?e.charCodeAt(u++):0),i=t>>2,s=(3&t)<<4|r>>4,o=1<h?(15&r)<<2|n>>6:64,a=2<h?63&n:64,f.push(p.charAt(i)+p.charAt(s)+p.charAt(o)+p.charAt(a));return f.join("")},r.decode=function(e){var t,r,n,i,s,o,a=0,f=0;if("data:"===e.substr(0,"data:".length))throw new Error("Invalid base64 input, it looks like a data url.");var u,d=3*(e=e.replace(/[^A-Za-z0-9\+\/\=]/g,"")).length/4;if(e.charAt(e.length-1)===p.charAt(64)&&d--,e.charAt(e.length-2)===p.charAt(64)&&d--,d%1!=0)throw new Error("Invalid base64 input, bad content length.");for(u=h.uint8array?new Uint8Array(0|d):new Array(0|d);a<e.length;)t=p.indexOf(e.charAt(a++))<<2|(i=p.indexOf(e.charAt(a++)))>>4,r=(15&i)<<4|(s=p.indexOf(e.charAt(a++)))>>2,n=(3&s)<<6|(o=p.indexOf(e.charAt(a++))),u[f++]=t,64!==s&&(u[f++]=r),64!==o&&(u[f++]=n);return u}},{"./support":30,"./utils":32}],2:[function(e,t,r){"use strict";var n=e("./external"),i=e("./stream/DataWorker"),s=e("./stream/Crc32Probe"),o=e("./stream/DataLengthProbe");function a(e,t,r,n,i){this.compressedSize=e,this.uncompressedSize=t,this.crc32=r,this.compression=n,this.compressedContent=i}a.prototype={getContentWorker:function(){var e=new i(n.Promise.resolve(this.compressedContent)).pipe(this.compression.uncompressWorker()).pipe(new o("data_length")),t=this;return e.on("end",function(){if(this.streamInfo.data_length!==t.uncompressedSize)throw new Error("Bug : uncompressed data size mismatch")}),e},getCompressedWorker:function(){return new i(n.Promise.resolve(this.compressedContent)).withStreamInfo("compressedSize",this.compressedSize).withStreamInfo("uncompressedSize",this.uncompressedSize).withStreamInfo("crc32",this.crc32).withStreamInfo("compression",this.compression)}},a.createWorkerFrom=function(e,t,r){return e.pipe(new s).pipe(new o("uncompressedSize")).pipe(t.compressWorker(r)).pipe(new o("compressedSize")).withStreamInfo("compression",t)},t.exports=a},{"./external":6,"./stream/Crc32Probe":25,"./stream/DataLengthProbe":26,"./stream/DataWorker":27}],3:[function(e,t,r){"use strict";var n=e("./stream/GenericWorker");r.STORE={magic:"\0\0",compressWorker:function(e){return new n("STORE compression")},uncompressWorker:function(){return new n("STORE decompression")}},r.DEFLATE=e("./flate")},{"./flate":7,"./stream/GenericWorker":28}],4:[function(e,t,r){"use strict";var n=e("./utils"),o=function(){for(var e,t=[],r=0;r<256;r++){e=r;for(var n=0;n<8;n++)e=1&e?3988292384^e>>>1:e>>>1;t[r]=e}return t}();t.exports=function(e,t){return void 0!==e&&e.length?"string"!==n.getTypeOf(e)?function(e,t,r){var n=o,i=0+r;e^=-1;for(var s=0;s<i;s++)e=e>>>8^n[255&(e^t[s])];return-1^e}(0|t,e,e.length):function(e,t,r){var n=o,i=0+r;e^=-1;for(var s=0;s<i;s++)e=e>>>8^n[255&(e^t.charCodeAt(s))];return-1^e}(0|t,e,e.length):0}},{"./utils":32}],5:[function(e,t,r){"use strict";r.base64=!1,r.binary=!1,r.dir=!1,r.createFolders=!0,r.date=null,r.compression=null,r.compressionOptions=null,r.comment=null,r.unixPermissions=null,r.dosPermissions=null},{}],6:[function(e,t,r){"use strict";var n;n="undefined"!=typeof Promise?Promise:e("lie"),t.exports={Promise:n}},{lie:37}],7:[function(e,t,r){"use strict";var n="undefined"!=typeof Uint8Array&&"undefined"!=typeof Uint16Array&&"undefined"!=typeof Uint32Array,i=e("pako"),s=e("./utils"),o=e("./stream/GenericWorker"),a=n?"uint8array":"array";function f(e,t){o.call(this,"FlateWorker/"+e),this._pako=null,this._pakoAction=e,this._pakoOptions=t,this.meta={}}r.magic="\b\0",s.inherits(f,o),f.prototype.processChunk=function(e){this.meta=e.meta,null===this._pako&&this._createPako(),this._pako.push(s.transformTo(a,e.data),!1)},f.prototype.flush=function(){o.prototype.flush.call(this),null===this._pako&&this._createPako(),this._pako.push([],!0)},f.prototype.cleanUp=function(){o.prototype.cleanUp.call(this),this._pako=null},f.prototype._createPako=function(){this._pako=new i[this._pakoAction]({raw:!0,level:this._pakoOptions.level||-1});var t=this;this._pako.onData=function(e){t.push({data:e,meta:t.meta})}},r.compressWorker=function(e){return new f("Deflate",e)},r.uncompressWorker=function(){return new f("Inflate",{})}},{"./stream/GenericWorker":28,"./utils":32,pako:38}],8:[function(e,t,r){"use strict";function O(e,t){var r,n="";for(r=0;r<t;r++)n+=String.fromCharCode(255&e),e>>>=8;return n}function i(e,t,r,n,i,s){var o,a,f=e.file,u=e.compression,d=s!==D.utf8encode,h=I.transformTo("string",s(f.name)),l=I.transformTo("string",D.utf8encode(f.name)),c=f.comment,p=I.transformTo("string",s(c)),m=I.transformTo("string",D.utf8encode(c)),_=l.length!==f.name.length,w=m.length!==c.length,v="",g="",y="",b=f.dir,k=f.date,x={crc32:0,compressedSize:0,uncompressedSize:0};t&&!r||(x.crc32=e.crc32,x.compressedSize=e.compressedSize,x.uncompressedSize=e.uncompressedSize);var S=0;t&&(S|=8),d||!_&&!w||(S|=2048);var E,z=0,C=0;b&&(z|=16),"UNIX"===i?(C=798,z|=((E=f.unixPermissions)||(E=b?16893:33204),(65535&E)<<16)):(C=20,z|=63&(f.dosPermissions||0)),o=k.getUTCHours(),o<<=6,o|=k.getUTCMinutes(),o<<=5,o|=k.getUTCSeconds()/2,a=k.getUTCFullYear()-1980,a<<=4,a|=k.getUTCMonth()+1,a<<=5,a|=k.getUTCDate(),_&&(v+="up"+O((g=O(1,1)+O(B(h),4)+l).length,2)+g),w&&(v+="uc"+O((y=O(1,1)+O(B(p),4)+m).length,2)+y);var A="";return A+="\n\0",A+=O(S,2),A+=u.magic,A+=O(o,2),A+=O(a,2),A+=O(x.crc32,4),A+=O(x.compressedSize,4),A+=O(x.uncompressedSize,4),A+=O(h.length,2),A+=O(v.length,2),{fileRecord:T.LOCAL_FILE_HEADER+A+h+v,dirRecord:T.CENTRAL_FILE_HEADER+O(C,2)+A+O(p.length,2)+"\0\0\0\0"+O(z,4)+O(n,4)+h+v+p}}var I=e("../utils"),s=e("../stream/GenericWorker"),D=e("../utf8"),B=e("../crc32"),T=e("../signature");function n(e,t,r,n){s.call(this,"ZipFileWorker"),this.bytesWritten=0,this.zipComment=t,this.zipPlatform=r,this.encodeFileName=n,this.streamFiles=e,this.accumulate=!1,this.contentBuffer=[],this.dirRecords=[],this.currentSourceOffset=0,this.entriesCount=0,this.currentFile=null,this._sources=[]}I.inherits(n,s),n.prototype.push=function(e){var t=e.meta.percent||0,r=this.entriesCount,n=this._sources.length;this.accumulate?this.contentBuffer.push(e):(this.bytesWritten+=e.data.length,s.prototype.push.call(this,{data:e.data,meta:{currentFile:this.currentFile,percent:r?(t+100*(r-n-1))/r:100}}))},n.prototype.openedSource=function(e){this.currentSourceOffset=this.bytesWritten,this.currentFile=e.file.name;var t=this.streamFiles&&!e.file.dir;if(t){var r=i(e,t,!1,this.currentSourceOffset,this.zipPlatform,this.encodeFileName);this.push({data:r.fileRecord,meta:{percent:0}})}else this.accumulate=!0},n.prototype.closedSource=function(e){this.accumulate=!1;var t,r=this.streamFiles&&!e.file.dir,n=i(e,r,!0,this.currentSourceOffset,this.zipPlatform,this.encodeFileName);if(this.dirRecords.push(n.dirRecord),r)this.push({data:(t=e,T.DATA_DESCRIPTOR+O(t.crc32,4)+O(t.compressedSize,4)+O(t.uncompressedSize,4)),meta:{percent:100}});else for(this.push({data:n.fileRecord,meta:{percent:0}});this.contentBuffer.length;)this.push(this.contentBuffer.shift());this.currentFile=null},n.prototype.flush=function(){for(var e=this.bytesWritten,t=0;t<this.dirRecords.length;t++)this.push({data:this.dirRecords[t],meta:{percent:100}});var r,n,i,s,o,a,f=this.bytesWritten-e,u=(r=this.dirRecords.length,n=f,i=e,s=this.zipComment,o=this.encodeFileName,a=I.transformTo("string",o(s)),T.CENTRAL_DIRECTORY_END+"\0\0\0\0"+O(r,2)+O(r,2)+O(n,4)+O(i,4)+O(a.length,2)+a);this.push({data:u,meta:{percent:100}})},n.prototype.prepareNextSource=function(){this.previous=this._sources.shift(),this.openedSource(this.previous.streamInfo),this.isPaused?this.previous.pause():this.previous.resume()},n.prototype.registerPrevious=function(e){this._sources.push(e);var t=this;return e.on("data",function(e){t.processChunk(e)}),e.on("end",function(){t.closedSource(t.previous.streamInfo),t._sources.length?t.prepareNextSource():t.end()}),e.on("error",function(e){t.error(e)}),this},n.prototype.resume=function(){return!!s.prototype.resume.call(this)&&(!this.previous&&this._sources.length?(this.prepareNextSource(),!0):this.previous||this._sources.length||this.generatedError?void 0:(this.end(),!0))},n.prototype.error=function(e){var t=this._sources;if(!s.prototype.error.call(this,e))return!1;for(var r=0;r<t.length;r++)try{t[r].error(e)}catch(e){}return!0},n.prototype.lock=function(){s.prototype.lock.call(this);for(var e=this._sources,t=0;t<e.length;t++)e[t].lock()},t.exports=n},{"../crc32":4,"../signature":23,"../stream/GenericWorker":28,"../utf8":31,"../utils":32}],9:[function(e,t,r){"use strict";var u=e("../compressions"),n=e("./ZipFileWorker");r.generateWorker=function(e,o,t){var a=new n(o.streamFiles,t,o.platform,o.encodeFileName),f=0;try{e.forEach(function(e,t){f++;var r=function(e,t){var r=e||t,n=u[r];if(!n)throw new Error(r+" is not a valid compression method !");return n}(t.options.compression,o.compression),n=t.options.compressionOptions||o.compressionOptions||{},i=t.dir,s=t.date;t._compressWorker(r,n).withStreamInfo("file",{name:e,dir:i,date:s,comment:t.comment||"",unixPermissions:t.unixPermissions,dosPermissions:t.dosPermissions}).pipe(a)}),a.entriesCount=f}catch(e){a.error(e)}return a}},{"../compressions":3,"./ZipFileWorker":8}],10:[function(e,t,r){"use strict";function n(){if(!(this instanceof n))return new n;if(arguments.length)throw new Error("The constructor with parameters has been removed in JSZip 3.0, please check the upgrade guide.");this.files={},this.comment=null,this.root="",this.clone=function(){var e=new n;for(var t in this)"function"!=typeof this[t]&&(e[t]=this[t]);return e}}(n.prototype=e("./object")).loadAsync=e("./load"),n.support=e("./support"),n.defaults=e("./defaults"),n.version="3.5.0",n.loadAsync=function(e,t){return(new n).loadAsync(e,t)},n.external=e("./external"),t.exports=n},{"./defaults":5,"./external":6,"./load":11,"./object":15,"./support":30}],11:[function(e,t,r){"use strict";var n=e("./utils"),i=e("./external"),a=e("./utf8"),f=e("./zipEntries"),s=e("./stream/Crc32Probe"),u=e("./nodejsUtils");function d(n){return new i.Promise(function(e,t){var r=n.decompressed.getContentWorker().pipe(new s);r.on("error",function(e){t(e)}).on("end",function(){r.streamInfo.crc32!==n.decompressed.crc32?t(new Error("Corrupted zip : CRC32 mismatch")):e()}).resume()})}t.exports=function(e,s){var o=this;return s=n.extend(s||{},{base64:!1,checkCRC32:!1,optimizedBinaryString:!1,createFolders:!1,decodeFileName:a.utf8decode}),u.isNode&&u.isStream(e)?i.Promise.reject(new Error("JSZip can't accept a stream when loading a zip file.")):n.prepareContent("the loaded zip file",e,!0,s.optimizedBinaryString,s.base64).then(function(e){var t=new f(s);return t.load(e),t}).then(function(e){var t=[i.Promise.resolve(e)],r=e.files;if(s.checkCRC32)for(var n=0;n<r.length;n++)t.push(d(r[n]));return i.Promise.all(t)}).then(function(e){for(var t=e.shift(),r=t.files,n=0;n<r.length;n++){var i=r[n];o.file(i.fileNameStr,i.decompressed,{binary:!0,optimizedBinaryString:!0,date:i.date,dir:i.dir,comment:i.fileCommentStr.length?i.fileCommentStr:null,unixPermissions:i.unixPermissions,dosPermissions:i.dosPermissions,createFolders:s.createFolders})}return t.zipComment.length&&(o.comment=t.zipComment),o})}},{"./external":6,"./nodejsUtils":14,"./stream/Crc32Probe":25,"./utf8":31,"./utils":32,"./zipEntries":33}],12:[function(e,t,r){"use strict";var n=e("../utils"),i=e("../stream/GenericWorker");function s(e,t){i.call(this,"Nodejs stream input adapter for "+e),this._upstreamEnded=!1,this._bindStream(t)}n.inherits(s,i),s.prototype._bindStream=function(e){var t=this;(this._stream=e).pause(),e.on("data",function(e){t.push({data:e,meta:{percent:0}})}).on("error",function(e){t.isPaused?this.generatedError=e:t.error(e)}).on("end",function(){t.isPaused?t._upstreamEnded=!0:t.end()})},s.prototype.pause=function(){return!!i.prototype.pause.call(this)&&(this._stream.pause(),!0)},s.prototype.resume=function(){return!!i.prototype.resume.call(this)&&(this._upstreamEnded?this.end():this._stream.resume(),!0)},t.exports=s},{"../stream/GenericWorker":28,"../utils":32}],13:[function(e,t,r){"use strict";var i=e("readable-stream").Readable;function n(e,t,r){i.call(this,t),this._helper=e;var n=this;e.on("data",function(e,t){n.push(e)||n._helper.pause(),r&&r(t)}).on("error",function(e){n.emit("error",e)}).on("end",function(){n.push(null)})}e("../utils").inherits(n,i),n.prototype._read=function(){this._helper.resume()},t.exports=n},{"../utils":32,"readable-stream":16}],14:[function(e,t,r){"use strict";t.exports={isNode:"undefined"!=typeof Buffer,newBufferFrom:function(e,t){if(Buffer.from&&Buffer.from!==Uint8Array.from)return Buffer.from(e,t);if("number"==typeof e)throw new Error('The "data" argument must not be a number');return new Buffer(e,t)},allocBuffer:function(e){if(Buffer.alloc)return Buffer.alloc(e);var t=new Buffer(e);return t.fill(0),t},isBuffer:function(e){return Buffer.isBuffer(e)},isStream:function(e){return e&&"function"==typeof e.on&&"function"==typeof e.pause&&"function"==typeof e.resume}}},{}],15:[function(e,t,r){"use strict";function s(e,t,r){var n,i=d.getTypeOf(t),s=d.extend(r||{},l);s.date=s.date||new Date,null!==s.compression&&(s.compression=s.compression.toUpperCase()),"string"==typeof s.unixPermissions&&(s.unixPermissions=parseInt(s.unixPermissions,8)),s.unixPermissions&&16384&s.unixPermissions&&(s.dir=!0),s.dosPermissions&&16&s.dosPermissions&&(s.dir=!0),s.dir&&(e=u(e)),s.createFolders&&(n=function(e){"/"===e.slice(-1)&&(e=e.substring(0,e.length-1));var t=e.lastIndexOf("/");return 0<t?e.substring(0,t):""}(e))&&w.call(this,n,!0);var o,a="string"===i&&!1===s.binary&&!1===s.base64;r&&void 0!==r.binary||(s.binary=!a),(t instanceof c&&0===t.uncompressedSize||s.dir||!t||0===t.length)&&(s.base64=!1,s.binary=!0,t="",s.compression="STORE",i="string"),o=t instanceof c||t instanceof h?t:m.isNode&&m.isStream(t)?new _(e,t):d.prepareContent(e,t,s.binary,s.optimizedBinaryString,s.base64);var f=new p(e,o,s);this.files[e]=f}function u(e){return"/"!==e.slice(-1)&&(e+="/"),e}var i=e("./utf8"),d=e("./utils"),h=e("./stream/GenericWorker"),o=e("./stream/StreamHelper"),l=e("./defaults"),c=e("./compressedObject"),p=e("./zipObject"),a=e("./generate"),m=e("./nodejsUtils"),_=e("./nodejs/NodejsStreamInputAdapter"),w=function(e,t){return t=void 0!==t?t:l.createFolders,e=u(e),this.files[e]||s.call(this,e,null,{dir:!0,createFolders:t}),this.files[e]};function f(e){return"[object RegExp]"===Object.prototype.toString.call(e)}var n={load:function(){throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.")},forEach:function(e){var t,r,n;for(t in this.files)this.files.hasOwnProperty(t)&&(n=this.files[t],(r=t.slice(this.root.length,t.length))&&t.slice(0,this.root.length)===this.root&&e(r,n))},filter:function(r){var n=[];return this.forEach(function(e,t){r(e,t)&&n.push(t)}),n},file:function(e,t,r){if(1!==arguments.length)return e=this.root+e,s.call(this,e,t,r),this;if(f(e)){var n=e;return this.filter(function(e,t){return!t.dir&&n.test(e)})}var i=this.files[this.root+e];return i&&!i.dir?i:null},folder:function(r){if(!r)return this;if(f(r))return this.filter(function(e,t){return t.dir&&r.test(e)});var e=this.root+r,t=w.call(this,e),n=this.clone();return n.root=t.name,n},remove:function(r){r=this.root+r;var e=this.files[r];if(e||("/"!==r.slice(-1)&&(r+="/"),e=this.files[r]),e&&!e.dir)delete this.files[r];else for(var t=this.filter(function(e,t){return t.name.slice(0,r.length)===r}),n=0;n<t.length;n++)delete this.files[t[n].name];return this},generate:function(e){throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.")},generateInternalStream:function(e){var t,r={};try{if((r=d.extend(e||{},{streamFiles:!1,compression:"STORE",compressionOptions:null,type:"",platform:"DOS",comment:null,mimeType:"application/zip",encodeFileName:i.utf8encode})).type=r.type.toLowerCase(),r.compression=r.compression.toUpperCase(),"binarystring"===r.type&&(r.type="string"),!r.type)throw new Error("No output type specified.");d.checkSupport(r.type),"darwin"!==r.platform&&"freebsd"!==r.platform&&"linux"!==r.platform&&"sunos"!==r.platform||(r.platform="UNIX"),"win32"===r.platform&&(r.platform="DOS");var n=r.comment||this.comment||"";t=a.generateWorker(this,r,n)}catch(e){(t=new h("error")).error(e)}return new o(t,r.type||"string",r.mimeType)},generateAsync:function(e,t){return this.generateInternalStream(e).accumulate(t)},generateNodeStream:function(e,t){return(e=e||{}).type||(e.type="nodebuffer"),this.generateInternalStream(e).toNodejsStream(t)}};t.exports=n},{"./compressedObject":2,"./defaults":5,"./generate":9,"./nodejs/NodejsStreamInputAdapter":12,"./nodejsUtils":14,"./stream/GenericWorker":28,"./stream/StreamHelper":29,"./utf8":31,"./utils":32,"./zipObject":35}],16:[function(e,t,r){t.exports=e("stream")},{stream:void 0}],17:[function(e,t,r){"use strict";var n=e("./DataReader");function i(e){n.call(this,e);for(var t=0;t<this.data.length;t++)e[t]=255&e[t]}e("../utils").inherits(i,n),i.prototype.byteAt=function(e){return this.data[this.zero+e]},i.prototype.lastIndexOfSignature=function(e){for(var t=e.charCodeAt(0),r=e.charCodeAt(1),n=e.charCodeAt(2),i=e.charCodeAt(3),s=this.length-4;0<=s;--s)if(this.data[s]===t&&this.data[s+1]===r&&this.data[s+2]===n&&this.data[s+3]===i)return s-this.zero;return-1},i.prototype.readAndCheckSignature=function(e){var t=e.charCodeAt(0),r=e.charCodeAt(1),n=e.charCodeAt(2),i=e.charCodeAt(3),s=this.readData(4);return t===s[0]&&r===s[1]&&n===s[2]&&i===s[3]},i.prototype.readData=function(e){if(this.checkOffset(e),0===e)return[];var t=this.data.slice(this.zero+this.index,this.zero+this.index+e);return this.index+=e,t},t.exports=i},{"../utils":32,"./DataReader":18}],18:[function(e,t,r){"use strict";var n=e("../utils");function i(e){this.data=e,this.length=e.length,this.index=0,this.zero=0}i.prototype={checkOffset:function(e){this.checkIndex(this.index+e)},checkIndex:function(e){if(this.length<this.zero+e||e<0)throw new Error("End of data reached (data length = "+this.length+", asked index = "+e+"). Corrupted zip ?")},setIndex:function(e){this.checkIndex(e),this.index=e},skip:function(e){this.setIndex(this.index+e)},byteAt:function(e){},readInt:function(e){var t,r=0;for(this.checkOffset(e),t=this.index+e-1;t>=this.index;t--)r=(r<<8)+this.byteAt(t);return this.index+=e,r},readString:function(e){return n.transformTo("string",this.readData(e))},readData:function(e){},lastIndexOfSignature:function(e){},readAndCheckSignature:function(e){},readDate:function(){var e=this.readInt(4);return new Date(Date.UTC(1980+(e>>25&127),(e>>21&15)-1,e>>16&31,e>>11&31,e>>5&63,(31&e)<<1))}},t.exports=i},{"../utils":32}],19:[function(e,t,r){"use strict";var n=e("./Uint8ArrayReader");function i(e){n.call(this,e)}e("../utils").inherits(i,n),i.prototype.readData=function(e){this.checkOffset(e);var t=this.data.slice(this.zero+this.index,this.zero+this.index+e);return this.index+=e,t},t.exports=i},{"../utils":32,"./Uint8ArrayReader":21}],20:[function(e,t,r){"use strict";var n=e("./DataReader");function i(e){n.call(this,e)}e("../utils").inherits(i,n),i.prototype.byteAt=function(e){return this.data.charCodeAt(this.zero+e)},i.prototype.lastIndexOfSignature=function(e){return this.data.lastIndexOf(e)-this.zero},i.prototype.readAndCheckSignature=function(e){return e===this.readData(4)},i.prototype.readData=function(e){this.checkOffset(e);var t=this.data.slice(this.zero+this.index,this.zero+this.index+e);return this.index+=e,t},t.exports=i},{"../utils":32,"./DataReader":18}],21:[function(e,t,r){"use strict";var n=e("./ArrayReader");function i(e){n.call(this,e)}e("../utils").inherits(i,n),i.prototype.readData=function(e){if(this.checkOffset(e),0===e)return new Uint8Array(0);var t=this.data.subarray(this.zero+this.index,this.zero+this.index+e);return this.index+=e,t},t.exports=i},{"../utils":32,"./ArrayReader":17}],22:[function(e,t,r){"use strict";var n=e("../utils"),i=e("../support"),s=e("./ArrayReader"),o=e("./StringReader"),a=e("./NodeBufferReader"),f=e("./Uint8ArrayReader");t.exports=function(e){var t=n.getTypeOf(e);return n.checkSupport(t),"string"!==t||i.uint8array?"nodebuffer"===t?new a(e):i.uint8array?new f(n.transformTo("uint8array",e)):new s(n.transformTo("array",e)):new o(e)}},{"../support":30,"../utils":32,"./ArrayReader":17,"./NodeBufferReader":19,"./StringReader":20,"./Uint8ArrayReader":21}],23:[function(e,t,r){"use strict";r.LOCAL_FILE_HEADER="PK",r.CENTRAL_FILE_HEADER="PK",r.CENTRAL_DIRECTORY_END="PK",r.ZIP64_CENTRAL_DIRECTORY_LOCATOR="PK",r.ZIP64_CENTRAL_DIRECTORY_END="PK",r.DATA_DESCRIPTOR="PK\b"},{}],24:[function(e,t,r){"use strict";var n=e("./GenericWorker"),i=e("../utils");function s(e){n.call(this,"ConvertWorker to "+e),this.destType=e}i.inherits(s,n),s.prototype.processChunk=function(e){this.push({data:i.transformTo(this.destType,e.data),meta:e.meta})},t.exports=s},{"../utils":32,"./GenericWorker":28}],25:[function(e,t,r){"use strict";var n=e("./GenericWorker"),i=e("../crc32");function s(){n.call(this,"Crc32Probe"),this.withStreamInfo("crc32",0)}e("../utils").inherits(s,n),s.prototype.processChunk=function(e){this.streamInfo.crc32=i(e.data,this.streamInfo.crc32||0),this.push(e)},t.exports=s},{"../crc32":4,"../utils":32,"./GenericWorker":28}],26:[function(e,t,r){"use strict";var n=e("../utils"),i=e("./GenericWorker");function s(e){i.call(this,"DataLengthProbe for "+e),this.propName=e,this.withStreamInfo(e,0)}n.inherits(s,i),s.prototype.processChunk=function(e){if(e){var t=this.streamInfo[this.propName]||0;this.streamInfo[this.propName]=t+e.data.length}i.prototype.processChunk.call(this,e)},t.exports=s},{"../utils":32,"./GenericWorker":28}],27:[function(e,t,r){"use strict";var n=e("../utils"),i=e("./GenericWorker");function s(e){i.call(this,"DataWorker");var t=this;this.dataIsReady=!1,this.index=0,this.max=0,this.data=null,this.type="",this._tickScheduled=!1,e.then(function(e){t.dataIsReady=!0,t.data=e,t.max=e&&e.length||0,t.type=n.getTypeOf(e),t.isPaused||t._tickAndRepeat()},function(e){t.error(e)})}n.inherits(s,i),s.prototype.cleanUp=function(){i.prototype.cleanUp.call(this),this.data=null},s.prototype.resume=function(){return!!i.prototype.resume.call(this)&&(!this._tickScheduled&&this.dataIsReady&&(this._tickScheduled=!0,n.delay(this._tickAndRepeat,[],this)),!0)},s.prototype._tickAndRepeat=function(){this._tickScheduled=!1,this.isPaused||this.isFinished||(this._tick(),this.isFinished||(n.delay(this._tickAndRepeat,[],this),this._tickScheduled=!0))},s.prototype._tick=function(){if(this.isPaused||this.isFinished)return!1;var e=null,t=Math.min(this.max,this.index+16384);if(this.index>=this.max)return this.end();switch(this.type){case"string":e=this.data.substring(this.index,t);break;case"uint8array":e=this.data.subarray(this.index,t);break;case"array":case"nodebuffer":e=this.data.slice(this.index,t)}return this.index=t,this.push({data:e,meta:{percent:this.max?this.index/this.max*100:0}})},t.exports=s},{"../utils":32,"./GenericWorker":28}],28:[function(e,t,r){"use strict";function n(e){this.name=e||"default",this.streamInfo={},this.generatedError=null,this.extraStreamInfo={},this.isPaused=!0,this.isFinished=!1,this.isLocked=!1,this._listeners={data:[],end:[],error:[]},this.previous=null}n.prototype={push:function(e){this.emit("data",e)},end:function(){if(this.isFinished)return!1;this.flush();try{this.emit("end"),this.cleanUp(),this.isFinished=!0}catch(e){this.emit("error",e)}return!0},error:function(e){return!this.isFinished&&(this.isPaused?this.generatedError=e:(this.isFinished=!0,this.emit("error",e),this.previous&&this.previous.error(e),this.cleanUp()),!0)},on:function(e,t){return this._listeners[e].push(t),this},cleanUp:function(){this.streamInfo=this.generatedError=this.extraStreamInfo=null,this._listeners=[]},emit:function(e,t){if(this._listeners[e])for(var r=0;r<this._listeners[e].length;r++)this._listeners[e][r].call(this,t)},pipe:function(e){return e.registerPrevious(this)},registerPrevious:function(e){if(this.isLocked)throw new Error("The stream '"+this+"' has already been used.");this.streamInfo=e.streamInfo,this.mergeStreamInfo(),this.previous=e;var t=this;return e.on("data",function(e){t.processChunk(e)}),e.on("end",function(){t.end()}),e.on("error",function(e){t.error(e)}),this},pause:function(){return!this.isPaused&&!this.isFinished&&(this.isPaused=!0,this.previous&&this.previous.pause(),!0)},resume:function(){if(!this.isPaused||this.isFinished)return!1;var e=this.isPaused=!1;return this.generatedError&&(this.error(this.generatedError),e=!0),this.previous&&this.previous.resume(),!e},flush:function(){},processChunk:function(e){this.push(e)},withStreamInfo:function(e,t){return this.extraStreamInfo[e]=t,this.mergeStreamInfo(),this},mergeStreamInfo:function(){for(var e in this.extraStreamInfo)this.extraStreamInfo.hasOwnProperty(e)&&(this.streamInfo[e]=this.extraStreamInfo[e])},lock:function(){if(this.isLocked)throw new Error("The stream '"+this+"' has already been used.");this.isLocked=!0,this.previous&&this.previous.lock()},toString:function(){var e="Worker "+this.name;return this.previous?this.previous+" -> "+e:e}},t.exports=n},{}],29:[function(e,t,r){"use strict";var u=e("../utils"),i=e("./ConvertWorker"),s=e("./GenericWorker"),d=e("../base64"),n=e("../support"),o=e("../external"),a=null;if(n.nodestream)try{a=e("../nodejs/NodejsStreamOutputAdapter")}catch(e){}function f(e,t,r){var n=t;switch(t){case"blob":case"arraybuffer":n="uint8array";break;case"base64":n="string"}try{this._internalType=n,this._outputType=t,this._mimeType=r,u.checkSupport(n),this._worker=e.pipe(new i(n)),e.lock()}catch(e){this._worker=new s("error"),this._worker.error(e)}}f.prototype={accumulate:function(e){return a=this,f=e,new o.Promise(function(t,r){var n=[],i=a._internalType,s=a._outputType,o=a._mimeType;a.on("data",function(e,t){n.push(e),f&&f(t)}).on("error",function(e){n=[],r(e)}).on("end",function(){try{var e=function(e,t,r){switch(e){case"blob":return u.newBlob(u.transformTo("arraybuffer",t),r);case"base64":return d.encode(t);default:return u.transformTo(e,t)}}(s,function(e,t){var r,n=0,i=null,s=0;for(r=0;r<t.length;r++)s+=t[r].length;switch(e){case"string":return t.join("");case"array":return Array.prototype.concat.apply([],t);case"uint8array":for(i=new Uint8Array(s),r=0;r<t.length;r++)i.set(t[r],n),n+=t[r].length;return i;case"nodebuffer":return Buffer.concat(t);default:throw new Error("concat : unsupported type '"+e+"'")}}(i,n),o);t(e)}catch(e){r(e)}n=[]}).resume()});var a,f},on:function(e,t){var r=this;return"data"===e?this._worker.on(e,function(e){t.call(r,e.data,e.meta)}):this._worker.on(e,function(){u.delay(t,arguments,r)}),this},resume:function(){return u.delay(this._worker.resume,[],this._worker),this},pause:function(){return this._worker.pause(),this},toNodejsStream:function(e){if(u.checkSupport("nodestream"),"nodebuffer"!==this._outputType)throw new Error(this._outputType+" is not supported by this method");return new a(this,{objectMode:"nodebuffer"!==this._outputType},e)}},t.exports=f},{"../base64":1,"../external":6,"../nodejs/NodejsStreamOutputAdapter":13,"../support":30,"../utils":32,"./ConvertWorker":24,"./GenericWorker":28}],30:[function(e,t,r){"use strict";if(r.base64=!0,r.array=!0,r.string=!0,r.arraybuffer="undefined"!=typeof ArrayBuffer&&"undefined"!=typeof Uint8Array,r.nodebuffer="undefined"!=typeof Buffer,r.uint8array="undefined"!=typeof Uint8Array,"undefined"==typeof ArrayBuffer)r.blob=!1;else{var n=new ArrayBuffer(0);try{r.blob=0===new Blob([n],{type:"application/zip"}).size}catch(e){try{var i=new(self.BlobBuilder||self.WebKitBlobBuilder||self.MozBlobBuilder||self.MSBlobBuilder);i.append(n),r.blob=0===i.getBlob("application/zip").size}catch(e){r.blob=!1}}}try{r.nodestream=!!e("readable-stream").Readable}catch(e){r.nodestream=!1}},{"readable-stream":16}],31:[function(e,t,s){"use strict";for(var a=e("./utils"),f=e("./support"),r=e("./nodejsUtils"),n=e("./stream/GenericWorker"),u=new Array(256),i=0;i<256;i++)u[i]=252<=i?6:248<=i?5:240<=i?4:224<=i?3:192<=i?2:1;function o(){n.call(this,"utf-8 decode"),this.leftOver=null}function d(){n.call(this,"utf-8 encode")}u[254]=u[254]=1,s.utf8encode=function(e){return f.nodebuffer?r.newBufferFrom(e,"utf-8"):function(e){var t,r,n,i,s,o=e.length,a=0;for(i=0;i<o;i++)55296==(64512&(r=e.charCodeAt(i)))&&i+1<o&&56320==(64512&(n=e.charCodeAt(i+1)))&&(r=65536+(r-55296<<10)+(n-56320),i++),a+=r<128?1:r<2048?2:r<65536?3:4;for(t=f.uint8array?new Uint8Array(a):new Array(a),i=s=0;s<a;i++)55296==(64512&(r=e.charCodeAt(i)))&&i+1<o&&56320==(64512&(n=e.charCodeAt(i+1)))&&(r=65536+(r-55296<<10)+(n-56320),i++),r<128?t[s++]=r:(r<2048?t[s++]=192|r>>>6:(r<65536?t[s++]=224|r>>>12:(t[s++]=240|r>>>18,t[s++]=128|r>>>12&63),t[s++]=128|r>>>6&63),t[s++]=128|63&r);return t}(e)},s.utf8decode=function(e){return f.nodebuffer?a.transformTo("nodebuffer",e).toString("utf-8"):function(e){var t,r,n,i,s=e.length,o=new Array(2*s);for(t=r=0;t<s;)if((n=e[t++])<128)o[r++]=n;else if(4<(i=u[n]))o[r++]=65533,t+=i-1;else{for(n&=2===i?31:3===i?15:7;1<i&&t<s;)n=n<<6|63&e[t++],i--;1<i?o[r++]=65533:n<65536?o[r++]=n:(n-=65536,o[r++]=55296|n>>10&1023,o[r++]=56320|1023&n)}return o.length!==r&&(o.subarray?o=o.subarray(0,r):o.length=r),a.applyFromCharCode(o)}(e=a.transformTo(f.uint8array?"uint8array":"array",e))},a.inherits(o,n),o.prototype.processChunk=function(e){var t=a.transformTo(f.uint8array?"uint8array":"array",e.data);if(this.leftOver&&this.leftOver.length){if(f.uint8array){var r=t;(t=new Uint8Array(r.length+this.leftOver.length)).set(this.leftOver,0),t.set(r,this.leftOver.length)}else t=this.leftOver.concat(t);this.leftOver=null}var n=function(e,t){var r;for((t=t||e.length)>e.length&&(t=e.length),r=t-1;0<=r&&128==(192&e[r]);)r--;return r<0?t:0===r?t:r+u[e[r]]>t?r:t}(t),i=t;n!==t.length&&(f.uint8array?(i=t.subarray(0,n),this.leftOver=t.subarray(n,t.length)):(i=t.slice(0,n),this.leftOver=t.slice(n,t.length))),this.push({data:s.utf8decode(i),meta:e.meta})},o.prototype.flush=function(){this.leftOver&&this.leftOver.length&&(this.push({data:s.utf8decode(this.leftOver),meta:{}}),this.leftOver=null)},s.Utf8DecodeWorker=o,a.inherits(d,n),d.prototype.processChunk=function(e){this.push({data:s.utf8encode(e.data),meta:e.meta})},s.Utf8EncodeWorker=d},{"./nodejsUtils":14,"./stream/GenericWorker":28,"./support":30,"./utils":32}],32:[function(e,t,a){"use strict";var f=e("./support"),u=e("./base64"),r=e("./nodejsUtils"),n=e("set-immediate-shim"),d=e("./external");function i(e){return e}function h(e,t){for(var r=0;r<e.length;++r)t[r]=255&e.charCodeAt(r);return t}a.newBlob=function(t,r){a.checkSupport("blob");try{return new Blob([t],{type:r})}catch(e){try{var n=new(self.BlobBuilder||self.WebKitBlobBuilder||self.MozBlobBuilder||self.MSBlobBuilder);return n.append(t),n.getBlob(r)}catch(e){throw new Error("Bug : can't construct the Blob.")}}};var s={stringifyByChunk:function(e,t,r){var n=[],i=0,s=e.length;if(s<=r)return String.fromCharCode.apply(null,e);for(;i<s;)"array"===t||"nodebuffer"===t?n.push(String.fromCharCode.apply(null,e.slice(i,Math.min(i+r,s)))):n.push(String.fromCharCode.apply(null,e.subarray(i,Math.min(i+r,s)))),i+=r;return n.join("")},stringifyByChar:function(e){for(var t="",r=0;r<e.length;r++)t+=String.fromCharCode(e[r]);return t},applyCanBeUsed:{uint8array:function(){try{return f.uint8array&&1===String.fromCharCode.apply(null,new Uint8Array(1)).length}catch(e){return!1}}(),nodebuffer:function(){try{return f.nodebuffer&&1===String.fromCharCode.apply(null,r.allocBuffer(1)).length}catch(e){return!1}}()}};function o(e){var t=65536,r=a.getTypeOf(e),n=!0;if("uint8array"===r?n=s.applyCanBeUsed.uint8array:"nodebuffer"===r&&(n=s.applyCanBeUsed.nodebuffer),n)for(;1<t;)try{return s.stringifyByChunk(e,r,t)}catch(e){t=Math.floor(t/2)}return s.stringifyByChar(e)}function l(e,t){for(var r=0;r<e.length;r++)t[r]=e[r];return t}a.applyFromCharCode=o;var c={};c.string={string:i,array:function(e){return h(e,new Array(e.length))},arraybuffer:function(e){return c.string.uint8array(e).buffer},uint8array:function(e){return h(e,new Uint8Array(e.length))},nodebuffer:function(e){return h(e,r.allocBuffer(e.length))}},c.array={string:o,array:i,arraybuffer:function(e){return new Uint8Array(e).buffer},uint8array:function(e){return new Uint8Array(e)},nodebuffer:function(e){return r.newBufferFrom(e)}},c.arraybuffer={string:function(e){return o(new Uint8Array(e))},array:function(e){return l(new Uint8Array(e),new Array(e.byteLength))},arraybuffer:i,uint8array:function(e){return new Uint8Array(e)},nodebuffer:function(e){return r.newBufferFrom(new Uint8Array(e))}},c.uint8array={string:o,array:function(e){return l(e,new Array(e.length))},arraybuffer:function(e){return e.buffer},uint8array:i,nodebuffer:function(e){return r.newBufferFrom(e)}},c.nodebuffer={string:o,array:function(e){return l(e,new Array(e.length))},arraybuffer:function(e){return c.nodebuffer.uint8array(e).buffer},uint8array:function(e){return l(e,new Uint8Array(e.length))},nodebuffer:i},a.transformTo=function(e,t){if(t=t||"",!e)return t;a.checkSupport(e);var r=a.getTypeOf(t);return c[r][e](t)},a.getTypeOf=function(e){return"string"==typeof e?"string":"[object Array]"===Object.prototype.toString.call(e)?"array":f.nodebuffer&&r.isBuffer(e)?"nodebuffer":f.uint8array&&e instanceof Uint8Array?"uint8array":f.arraybuffer&&e instanceof ArrayBuffer?"arraybuffer":void 0},a.checkSupport=function(e){if(!f[e.toLowerCase()])throw new Error(e+" is not supported by this platform")},a.MAX_VALUE_16BITS=65535,a.MAX_VALUE_32BITS=-1,a.pretty=function(e){var t,r,n="";for(r=0;r<(e||"").length;r++)n+="\\x"+((t=e.charCodeAt(r))<16?"0":"")+t.toString(16).toUpperCase();return n},a.delay=function(e,t,r){n(function(){e.apply(r||null,t||[])})},a.inherits=function(e,t){function r(){}r.prototype=t.prototype,e.prototype=new r},a.extend=function(){var e,t,r={};for(e=0;e<arguments.length;e++)for(t in arguments[e])arguments[e].hasOwnProperty(t)&&void 0===r[t]&&(r[t]=arguments[e][t]);return r},a.prepareContent=function(n,e,i,s,o){return d.Promise.resolve(e).then(function(n){return f.blob&&(n instanceof Blob||-1!==["[object File]","[object Blob]"].indexOf(Object.prototype.toString.call(n)))&&"undefined"!=typeof FileReader?new d.Promise(function(t,r){var e=new FileReader;e.onload=function(e){t(e.target.result)},e.onerror=function(e){r(e.target.error)},e.readAsArrayBuffer(n)}):n}).then(function(e){var t,r=a.getTypeOf(e);return r?("arraybuffer"===r?e=a.transformTo("uint8array",e):"string"===r&&(o?e=u.decode(e):i&&!0!==s&&(e=h(t=e,f.uint8array?new Uint8Array(t.length):new Array(t.length)))),e):d.Promise.reject(new Error("Can't read the data of '"+n+"'. Is it in a supported JavaScript type (String, Blob, ArrayBuffer, etc) ?"))})}},{"./base64":1,"./external":6,"./nodejsUtils":14,"./support":30,"set-immediate-shim":54}],33:[function(e,t,r){"use strict";var n=e("./reader/readerFor"),i=e("./utils"),s=e("./signature"),o=e("./zipEntry"),a=(e("./utf8"),e("./support"));function f(e){this.files=[],this.loadOptions=e}f.prototype={checkSignature:function(e){if(!this.reader.readAndCheckSignature(e)){this.reader.index-=4;var t=this.reader.readString(4);throw new Error("Corrupted zip or bug: unexpected signature ("+i.pretty(t)+", expected "+i.pretty(e)+")")}},isSignature:function(e,t){var r=this.reader.index;this.reader.setIndex(e);var n=this.reader.readString(4)===t;return this.reader.setIndex(r),n},readBlockEndOfCentral:function(){this.diskNumber=this.reader.readInt(2),this.diskWithCentralDirStart=this.reader.readInt(2),this.centralDirRecordsOnThisDisk=this.reader.readInt(2),this.centralDirRecords=this.reader.readInt(2),this.centralDirSize=this.reader.readInt(4),this.centralDirOffset=this.reader.readInt(4),this.zipCommentLength=this.reader.readInt(2);var e=this.reader.readData(this.zipCommentLength),t=a.uint8array?"uint8array":"array",r=i.transformTo(t,e);this.zipComment=this.loadOptions.decodeFileName(r)},readBlockZip64EndOfCentral:function(){this.zip64EndOfCentralSize=this.reader.readInt(8),this.reader.skip(4),this.diskNumber=this.reader.readInt(4),this.diskWithCentralDirStart=this.reader.readInt(4),this.centralDirRecordsOnThisDisk=this.reader.readInt(8),this.centralDirRecords=this.reader.readInt(8),this.centralDirSize=this.reader.readInt(8),this.centralDirOffset=this.reader.readInt(8),this.zip64ExtensibleData={};for(var e,t,r,n=this.zip64EndOfCentralSize-44;0<n;)e=this.reader.readInt(2),t=this.reader.readInt(4),r=this.reader.readData(t),this.zip64ExtensibleData[e]={id:e,length:t,value:r}},readBlockZip64EndOfCentralLocator:function(){if(this.diskWithZip64CentralDirStart=this.reader.readInt(4),this.relativeOffsetEndOfZip64CentralDir=this.reader.readInt(8),this.disksCount=this.reader.readInt(4),1<this.disksCount)throw new Error("Multi-volumes zip are not supported")},readLocalFiles:function(){var e,t;for(e=0;e<this.files.length;e++)t=this.files[e],this.reader.setIndex(t.localHeaderOffset),this.checkSignature(s.LOCAL_FILE_HEADER),t.readLocalPart(this.reader),t.handleUTF8(),t.processAttributes()},readCentralDir:function(){var e;for(this.reader.setIndex(this.centralDirOffset);this.reader.readAndCheckSignature(s.CENTRAL_FILE_HEADER);)(e=new o({zip64:this.zip64},this.loadOptions)).readCentralPart(this.reader),this.files.push(e);if(this.centralDirRecords!==this.files.length&&0!==this.centralDirRecords&&0===this.files.length)throw new Error("Corrupted zip or bug: expected "+this.centralDirRecords+" records in central dir, got "+this.files.length)},readEndOfCentral:function(){var e=this.reader.lastIndexOfSignature(s.CENTRAL_DIRECTORY_END);if(e<0)throw this.isSignature(0,s.LOCAL_FILE_HEADER)?new Error("Corrupted zip: can't find end of central directory"):new Error("Can't find end of central directory : is this a zip file ? If it is, see https://stuk.github.io/jszip/documentation/howto/read_zip.html");this.reader.setIndex(e);var t=e;if(this.checkSignature(s.CENTRAL_DIRECTORY_END),this.readBlockEndOfCentral(),this.diskNumber===i.MAX_VALUE_16BITS||this.diskWithCentralDirStart===i.MAX_VALUE_16BITS||this.centralDirRecordsOnThisDisk===i.MAX_VALUE_16BITS||this.centralDirRecords===i.MAX_VALUE_16BITS||this.centralDirSize===i.MAX_VALUE_32BITS||this.centralDirOffset===i.MAX_VALUE_32BITS){if(this.zip64=!0,(e=this.reader.lastIndexOfSignature(s.ZIP64_CENTRAL_DIRECTORY_LOCATOR))<0)throw new Error("Corrupted zip: can't find the ZIP64 end of central directory locator");if(this.reader.setIndex(e),this.checkSignature(s.ZIP64_CENTRAL_DIRECTORY_LOCATOR),this.readBlockZip64EndOfCentralLocator(),!this.isSignature(this.relativeOffsetEndOfZip64CentralDir,s.ZIP64_CENTRAL_DIRECTORY_END)&&(this.relativeOffsetEndOfZip64CentralDir=this.reader.lastIndexOfSignature(s.ZIP64_CENTRAL_DIRECTORY_END),this.relativeOffsetEndOfZip64CentralDir<0))throw new Error("Corrupted zip: can't find the ZIP64 end of central directory");this.reader.setIndex(this.relativeOffsetEndOfZip64CentralDir),this.checkSignature(s.ZIP64_CENTRAL_DIRECTORY_END),this.readBlockZip64EndOfCentral()}var r=this.centralDirOffset+this.centralDirSize;this.zip64&&(r+=20,r+=12+this.zip64EndOfCentralSize);var n=t-r;if(0<n)this.isSignature(t,s.CENTRAL_FILE_HEADER)||(this.reader.zero=n);else if(n<0)throw new Error("Corrupted zip: missing "+Math.abs(n)+" bytes.")},prepareReader:function(e){this.reader=n(e)},load:function(e){this.prepareReader(e),this.readEndOfCentral(),this.readCentralDir(),this.readLocalFiles()}},t.exports=f},{"./reader/readerFor":22,"./signature":23,"./support":30,"./utf8":31,"./utils":32,"./zipEntry":34}],34:[function(e,t,r){"use strict";var n=e("./reader/readerFor"),s=e("./utils"),i=e("./compressedObject"),o=e("./crc32"),a=e("./utf8"),f=e("./compressions"),u=e("./support");function d(e,t){this.options=e,this.loadOptions=t}d.prototype={isEncrypted:function(){return 1==(1&this.bitFlag)},useUTF8:function(){return 2048==(2048&this.bitFlag)},readLocalPart:function(e){var t,r;if(e.skip(22),this.fileNameLength=e.readInt(2),r=e.readInt(2),this.fileName=e.readData(this.fileNameLength),e.skip(r),-1===this.compressedSize||-1===this.uncompressedSize)throw new Error("Bug or corrupted zip : didn't get enough information from the central directory (compressedSize === -1 || uncompressedSize === -1)");if(null===(t=function(e){for(var t in f)if(f.hasOwnProperty(t)&&f[t].magic===e)return f[t];return null}(this.compressionMethod)))throw new Error("Corrupted zip : compression "+s.pretty(this.compressionMethod)+" unknown (inner file : "+s.transformTo("string",this.fileName)+")");this.decompressed=new i(this.compressedSize,this.uncompressedSize,this.crc32,t,e.readData(this.compressedSize))},readCentralPart:function(e){this.versionMadeBy=e.readInt(2),e.skip(2),this.bitFlag=e.readInt(2),this.compressionMethod=e.readString(2),this.date=e.readDate(),this.crc32=e.readInt(4),this.compressedSize=e.readInt(4),this.uncompressedSize=e.readInt(4);var t=e.readInt(2);if(this.extraFieldsLength=e.readInt(2),this.fileCommentLength=e.readInt(2),this.diskNumberStart=e.readInt(2),this.internalFileAttributes=e.readInt(2),this.externalFileAttributes=e.readInt(4),this.localHeaderOffset=e.readInt(4),this.isEncrypted())throw new Error("Encrypted zip are not supported");e.skip(t),this.readExtraFields(e),this.parseZIP64ExtraField(e),this.fileComment=e.readData(this.fileCommentLength)},processAttributes:function(){this.unixPermissions=null,this.dosPermissions=null;var e=this.versionMadeBy>>8;this.dir=!!(16&this.externalFileAttributes),0==e&&(this.dosPermissions=63&this.externalFileAttributes),3==e&&(this.unixPermissions=this.externalFileAttributes>>16&65535),this.dir||"/"!==this.fileNameStr.slice(-1)||(this.dir=!0)},parseZIP64ExtraField:function(e){if(this.extraFields[1]){var t=n(this.extraFields[1].value);this.uncompressedSize===s.MAX_VALUE_32BITS&&(this.uncompressedSize=t.readInt(8)),this.compressedSize===s.MAX_VALUE_32BITS&&(this.compressedSize=t.readInt(8)),this.localHeaderOffset===s.MAX_VALUE_32BITS&&(this.localHeaderOffset=t.readInt(8)),this.diskNumberStart===s.MAX_VALUE_32BITS&&(this.diskNumberStart=t.readInt(4))}},readExtraFields:function(e){var t,r,n,i=e.index+this.extraFieldsLength;for(this.extraFields||(this.extraFields={});e.index+4<i;)t=e.readInt(2),r=e.readInt(2),n=e.readData(r),this.extraFields[t]={id:t,length:r,value:n};e.setIndex(i)},handleUTF8:function(){var e=u.uint8array?"uint8array":"array";if(this.useUTF8())this.fileNameStr=a.utf8decode(this.fileName),this.fileCommentStr=a.utf8decode(this.fileComment);else{var t=this.findExtraFieldUnicodePath();if(null!==t)this.fileNameStr=t;else{var r=s.transformTo(e,this.fileName);this.fileNameStr=this.loadOptions.decodeFileName(r)}var n=this.findExtraFieldUnicodeComment();if(null!==n)this.fileCommentStr=n;else{var i=s.transformTo(e,this.fileComment);this.fileCommentStr=this.loadOptions.decodeFileName(i)}}},findExtraFieldUnicodePath:function(){var e=this.extraFields[28789];if(e){var t=n(e.value);return 1!==t.readInt(1)?null:o(this.fileName)!==t.readInt(4)?null:a.utf8decode(t.readData(e.length-5))}return null},findExtraFieldUnicodeComment:function(){var e=this.extraFields[25461];if(e){var t=n(e.value);return 1!==t.readInt(1)?null:o(this.fileComment)!==t.readInt(4)?null:a.utf8decode(t.readData(e.length-5))}return null}},t.exports=d},{"./compressedObject":2,"./compressions":3,"./crc32":4,"./reader/readerFor":22,"./support":30,"./utf8":31,"./utils":32}],35:[function(e,t,r){"use strict";function n(e,t,r){this.name=e,this.dir=r.dir,this.date=r.date,this.comment=r.comment,this.unixPermissions=r.unixPermissions,this.dosPermissions=r.dosPermissions,this._data=t,this._dataBinary=r.binary,this.options={compression:r.compression,compressionOptions:r.compressionOptions}}var s=e("./stream/StreamHelper"),i=e("./stream/DataWorker"),o=e("./utf8"),a=e("./compressedObject"),f=e("./stream/GenericWorker");n.prototype={internalStream:function(e){var t=null,r="string";try{if(!e)throw new Error("No output type specified.");var n="string"===(r=e.toLowerCase())||"text"===r;"binarystring"!==r&&"text"!==r||(r="string"),t=this._decompressWorker();var i=!this._dataBinary;i&&!n&&(t=t.pipe(new o.Utf8EncodeWorker)),!i&&n&&(t=t.pipe(new o.Utf8DecodeWorker))}catch(e){(t=new f("error")).error(e)}return new s(t,r,"")},async:function(e,t){return this.internalStream(e).accumulate(t)},nodeStream:function(e,t){return this.internalStream(e||"nodebuffer").toNodejsStream(t)},_compressWorker:function(e,t){if(this._data instanceof a&&this._data.compression.magic===e.magic)return this._data.getCompressedWorker();var r=this._decompressWorker();return this._dataBinary||(r=r.pipe(new o.Utf8EncodeWorker)),a.createWorkerFrom(r,e,t)},_decompressWorker:function(){return this._data instanceof a?this._data.getContentWorker():this._data instanceof f?this._data:new i(this._data)}};for(var u=["asText","asBinary","asNodeBuffer","asUint8Array","asArrayBuffer"],d=function(){throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.")},h=0;h<u.length;h++)n.prototype[u[h]]=d;t.exports=n},{"./compressedObject":2,"./stream/DataWorker":27,"./stream/GenericWorker":28,"./stream/StreamHelper":29,"./utf8":31}],36:[function(e,d,t){(function(t){"use strict";var r,n,e=t.MutationObserver||t.WebKitMutationObserver;if(e){var i=0,s=new e(u),o=t.document.createTextNode("");s.observe(o,{characterData:!0}),r=function(){o.data=i=++i%2}}else if(t.setImmediate||void 0===t.MessageChannel)r="document"in t&&"onreadystatechange"in t.document.createElement("script")?function(){var e=t.document.createElement("script");e.onreadystatechange=function(){u(),e.onreadystatechange=null,e.parentNode.removeChild(e),e=null},t.document.documentElement.appendChild(e)}:function(){setTimeout(u,0)};else{var a=new t.MessageChannel;a.port1.onmessage=u,r=function(){a.port2.postMessage(0)}}var f=[];function u(){var e,t;n=!0;for(var r=f.length;r;){for(t=f,f=[],e=-1;++e<r;)t[e]();r=f.length}n=!1}d.exports=function(e){1!==f.push(e)||n||r()}}).call(this,void 0!==r?r:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}],37:[function(e,t,r){"use strict";var i=e("immediate");function u(){}var d={},s=["REJECTED"],o=["FULFILLED"],n=["PENDING"];function a(e){if("function"!=typeof e)throw new TypeError("resolver must be a function");this.state=n,this.queue=[],this.outcome=void 0,e!==u&&c(this,e)}function f(e,t,r){this.promise=e,"function"==typeof t&&(this.onFulfilled=t,this.callFulfilled=this.otherCallFulfilled),"function"==typeof r&&(this.onRejected=r,this.callRejected=this.otherCallRejected)}function h(t,r,n){i(function(){var e;try{e=r(n)}catch(e){return d.reject(t,e)}e===t?d.reject(t,new TypeError("Cannot resolve promise with itself")):d.resolve(t,e)})}function l(e){var t=e&&e.then;if(e&&("object"==typeof e||"function"==typeof e)&&"function"==typeof t)return function(){t.apply(e,arguments)}}function c(t,e){var r=!1;function n(e){r||(r=!0,d.reject(t,e))}function i(e){r||(r=!0,d.resolve(t,e))}var s=p(function(){e(i,n)});"error"===s.status&&n(s.value)}function p(e,t){var r={};try{r.value=e(t),r.status="success"}catch(e){r.status="error",r.value=e}return r}(t.exports=a).prototype.finally=function(t){if("function"!=typeof t)return this;var r=this.constructor;return this.then(function(e){return r.resolve(t()).then(function(){return e})},function(e){return r.resolve(t()).then(function(){throw e})})},a.prototype.catch=function(e){return this.then(null,e)},a.prototype.then=function(e,t){if("function"!=typeof e&&this.state===o||"function"!=typeof t&&this.state===s)return this;var r=new this.constructor(u);return this.state!==n?h(r,this.state===o?e:t,this.outcome):this.queue.push(new f(r,e,t)),r},f.prototype.callFulfilled=function(e){d.resolve(this.promise,e)},f.prototype.otherCallFulfilled=function(e){h(this.promise,this.onFulfilled,e)},f.prototype.callRejected=function(e){d.reject(this.promise,e)},f.prototype.otherCallRejected=function(e){h(this.promise,this.onRejected,e)},d.resolve=function(e,t){var r=p(l,t);if("error"===r.status)return d.reject(e,r.value);var n=r.value;if(n)c(e,n);else{e.state=o,e.outcome=t;for(var i=-1,s=e.queue.length;++i<s;)e.queue[i].callFulfilled(t)}return e},d.reject=function(e,t){e.state=s,e.outcome=t;for(var r=-1,n=e.queue.length;++r<n;)e.queue[r].callRejected(t);return e},a.resolve=function(e){return e instanceof this?e:d.resolve(new this(u),e)},a.reject=function(e){var t=new this(u);return d.reject(t,e)},a.all=function(e){var r=this;if("[object Array]"!==Object.prototype.toString.call(e))return this.reject(new TypeError("must be an array"));var n=e.length,i=!1;if(!n)return this.resolve([]);for(var s=new Array(n),o=0,t=-1,a=new this(u);++t<n;)f(e[t],t);return a;function f(e,t){r.resolve(e).then(function(e){s[t]=e,++o!==n||i||(i=!0,d.resolve(a,s))},function(e){i||(i=!0,d.reject(a,e))})}},a.race=function(e){if("[object Array]"!==Object.prototype.toString.call(e))return this.reject(new TypeError("must be an array"));var t=e.length,r=!1;if(!t)return this.resolve([]);for(var n,i=-1,s=new this(u);++i<t;)n=e[i],this.resolve(n).then(function(e){r||(r=!0,d.resolve(s,e))},function(e){r||(r=!0,d.reject(s,e))});return s}},{immediate:36}],38:[function(e,t,r){"use strict";var n={};(0,e("./lib/utils/common").assign)(n,e("./lib/deflate"),e("./lib/inflate"),e("./lib/zlib/constants")),t.exports=n},{"./lib/deflate":39,"./lib/inflate":40,"./lib/utils/common":41,"./lib/zlib/constants":44}],39:[function(e,t,r){"use strict";var o=e("./zlib/deflate"),a=e("./utils/common"),f=e("./utils/strings"),i=e("./zlib/messages"),s=e("./zlib/zstream"),u=Object.prototype.toString,d=0,h=-1,l=0,c=8;function p(e){if(!(this instanceof p))return new p(e);this.options=a.assign({level:h,method:c,chunkSize:16384,windowBits:15,memLevel:8,strategy:l,to:""},e||{});var t=this.options;t.raw&&0<t.windowBits?t.windowBits=-t.windowBits:t.gzip&&0<t.windowBits&&t.windowBits<16&&(t.windowBits+=16),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new s,this.strm.avail_out=0;var r=o.deflateInit2(this.strm,t.level,t.method,t.windowBits,t.memLevel,t.strategy);if(r!==d)throw new Error(i[r]);if(t.header&&o.deflateSetHeader(this.strm,t.header),t.dictionary){var n;if(n="string"==typeof t.dictionary?f.string2buf(t.dictionary):"[object ArrayBuffer]"===u.call(t.dictionary)?new Uint8Array(t.dictionary):t.dictionary,(r=o.deflateSetDictionary(this.strm,n))!==d)throw new Error(i[r]);this._dict_set=!0}}function n(e,t){var r=new p(t);if(r.push(e,!0),r.err)throw r.msg||i[r.err];return r.result}p.prototype.push=function(e,t){var r,n,i=this.strm,s=this.options.chunkSize;if(this.ended)return!1;n=t===~~t?t:!0===t?4:0,"string"==typeof e?i.input=f.string2buf(e):"[object ArrayBuffer]"===u.call(e)?i.input=new Uint8Array(e):i.input=e,i.next_in=0,i.avail_in=i.input.length;do{if(0===i.avail_out&&(i.output=new a.Buf8(s),i.next_out=0,i.avail_out=s),1!==(r=o.deflate(i,n))&&r!==d)return this.onEnd(r),!(this.ended=!0);0!==i.avail_out&&(0!==i.avail_in||4!==n&&2!==n)||("string"===this.options.to?this.onData(f.buf2binstring(a.shrinkBuf(i.output,i.next_out))):this.onData(a.shrinkBuf(i.output,i.next_out)))}while((0<i.avail_in||0===i.avail_out)&&1!==r);return 4===n?(r=o.deflateEnd(this.strm),this.onEnd(r),this.ended=!0,r===d):2!==n||(this.onEnd(d),!(i.avail_out=0))},p.prototype.onData=function(e){this.chunks.push(e)},p.prototype.onEnd=function(e){e===d&&("string"===this.options.to?this.result=this.chunks.join(""):this.result=a.flattenChunks(this.chunks)),this.chunks=[],this.err=e,this.msg=this.strm.msg},r.Deflate=p,r.deflate=n,r.deflateRaw=function(e,t){return(t=t||{}).raw=!0,n(e,t)},r.gzip=function(e,t){return(t=t||{}).gzip=!0,n(e,t)}},{"./utils/common":41,"./utils/strings":42,"./zlib/deflate":46,"./zlib/messages":51,"./zlib/zstream":53}],40:[function(e,t,r){"use strict";var l=e("./zlib/inflate"),c=e("./utils/common"),p=e("./utils/strings"),m=e("./zlib/constants"),n=e("./zlib/messages"),i=e("./zlib/zstream"),s=e("./zlib/gzheader"),_=Object.prototype.toString;function o(e){if(!(this instanceof o))return new o(e);this.options=c.assign({chunkSize:16384,windowBits:0,to:""},e||{});var t=this.options;t.raw&&0<=t.windowBits&&t.windowBits<16&&(t.windowBits=-t.windowBits,0===t.windowBits&&(t.windowBits=-15)),!(0<=t.windowBits&&t.windowBits<16)||e&&e.windowBits||(t.windowBits+=32),15<t.windowBits&&t.windowBits<48&&0==(15&t.windowBits)&&(t.windowBits|=15),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new i,this.strm.avail_out=0;var r=l.inflateInit2(this.strm,t.windowBits);if(r!==m.Z_OK)throw new Error(n[r]);this.header=new s,l.inflateGetHeader(this.strm,this.header)}function a(e,t){var r=new o(t);if(r.push(e,!0),r.err)throw r.msg||n[r.err];return r.result}o.prototype.push=function(e,t){var r,n,i,s,o,a,f=this.strm,u=this.options.chunkSize,d=this.options.dictionary,h=!1;if(this.ended)return!1;n=t===~~t?t:!0===t?m.Z_FINISH:m.Z_NO_FLUSH,"string"==typeof e?f.input=p.binstring2buf(e):"[object ArrayBuffer]"===_.call(e)?f.input=new Uint8Array(e):f.input=e,f.next_in=0,f.avail_in=f.input.length;do{if(0===f.avail_out&&(f.output=new c.Buf8(u),f.next_out=0,f.avail_out=u),(r=l.inflate(f,m.Z_NO_FLUSH))===m.Z_NEED_DICT&&d&&(a="string"==typeof d?p.string2buf(d):"[object ArrayBuffer]"===_.call(d)?new Uint8Array(d):d,r=l.inflateSetDictionary(this.strm,a)),r===m.Z_BUF_ERROR&&!0===h&&(r=m.Z_OK,h=!1),r!==m.Z_STREAM_END&&r!==m.Z_OK)return this.onEnd(r),!(this.ended=!0);f.next_out&&(0!==f.avail_out&&r!==m.Z_STREAM_END&&(0!==f.avail_in||n!==m.Z_FINISH&&n!==m.Z_SYNC_FLUSH)||("string"===this.options.to?(i=p.utf8border(f.output,f.next_out),s=f.next_out-i,o=p.buf2string(f.output,i),f.next_out=s,f.avail_out=u-s,s&&c.arraySet(f.output,f.output,i,s,0),this.onData(o)):this.onData(c.shrinkBuf(f.output,f.next_out)))),0===f.avail_in&&0===f.avail_out&&(h=!0)}while((0<f.avail_in||0===f.avail_out)&&r!==m.Z_STREAM_END);return r===m.Z_STREAM_END&&(n=m.Z_FINISH),n===m.Z_FINISH?(r=l.inflateEnd(this.strm),this.onEnd(r),this.ended=!0,r===m.Z_OK):n!==m.Z_SYNC_FLUSH||(this.onEnd(m.Z_OK),!(f.avail_out=0))},o.prototype.onData=function(e){this.chunks.push(e)},o.prototype.onEnd=function(e){e===m.Z_OK&&("string"===this.options.to?this.result=this.chunks.join(""):this.result=c.flattenChunks(this.chunks)),this.chunks=[],this.err=e,this.msg=this.strm.msg},r.Inflate=o,r.inflate=a,r.inflateRaw=function(e,t){return(t=t||{}).raw=!0,a(e,t)},r.ungzip=a},{"./utils/common":41,"./utils/strings":42,"./zlib/constants":44,"./zlib/gzheader":47,"./zlib/inflate":49,"./zlib/messages":51,"./zlib/zstream":53}],41:[function(e,t,r){"use strict";var n="undefined"!=typeof Uint8Array&&"undefined"!=typeof Uint16Array&&"undefined"!=typeof Int32Array;r.assign=function(e){for(var t=Array.prototype.slice.call(arguments,1);t.length;){var r=t.shift();if(r){if("object"!=typeof r)throw new TypeError(r+"must be non-object");for(var n in r)r.hasOwnProperty(n)&&(e[n]=r[n])}}return e},r.shrinkBuf=function(e,t){return e.length===t?e:e.subarray?e.subarray(0,t):(e.length=t,e)};var i={arraySet:function(e,t,r,n,i){if(t.subarray&&e.subarray)e.set(t.subarray(r,r+n),i);else for(var s=0;s<n;s++)e[i+s]=t[r+s]},flattenChunks:function(e){var t,r,n,i,s,o;for(t=n=0,r=e.length;t<r;t++)n+=e[t].length;for(o=new Uint8Array(n),t=i=0,r=e.length;t<r;t++)s=e[t],o.set(s,i),i+=s.length;return o}},s={arraySet:function(e,t,r,n,i){for(var s=0;s<n;s++)e[i+s]=t[r+s]},flattenChunks:function(e){return[].concat.apply([],e)}};r.setTyped=function(e){e?(r.Buf8=Uint8Array,r.Buf16=Uint16Array,r.Buf32=Int32Array,r.assign(r,i)):(r.Buf8=Array,r.Buf16=Array,r.Buf32=Array,r.assign(r,s))},r.setTyped(n)},{}],42:[function(e,t,r){"use strict";var f=e("./common"),i=!0,s=!0;try{String.fromCharCode.apply(null,[0])}catch(e){i=!1}try{String.fromCharCode.apply(null,new Uint8Array(1))}catch(e){s=!1}for(var u=new f.Buf8(256),n=0;n<256;n++)u[n]=252<=n?6:248<=n?5:240<=n?4:224<=n?3:192<=n?2:1;function d(e,t){if(t<65537&&(e.subarray&&s||!e.subarray&&i))return String.fromCharCode.apply(null,f.shrinkBuf(e,t));for(var r="",n=0;n<t;n++)r+=String.fromCharCode(e[n]);return r}u[254]=u[254]=1,r.string2buf=function(e){var t,r,n,i,s,o=e.length,a=0;for(i=0;i<o;i++)55296==(64512&(r=e.charCodeAt(i)))&&i+1<o&&56320==(64512&(n=e.charCodeAt(i+1)))&&(r=65536+(r-55296<<10)+(n-56320),i++),a+=r<128?1:r<2048?2:r<65536?3:4;for(t=new f.Buf8(a),i=s=0;s<a;i++)55296==(64512&(r=e.charCodeAt(i)))&&i+1<o&&56320==(64512&(n=e.charCodeAt(i+1)))&&(r=65536+(r-55296<<10)+(n-56320),i++),r<128?t[s++]=r:(r<2048?t[s++]=192|r>>>6:(r<65536?t[s++]=224|r>>>12:(t[s++]=240|r>>>18,t[s++]=128|r>>>12&63),t[s++]=128|r>>>6&63),t[s++]=128|63&r);return t},r.buf2binstring=function(e){return d(e,e.length)},r.binstring2buf=function(e){for(var t=new f.Buf8(e.length),r=0,n=t.length;r<n;r++)t[r]=e.charCodeAt(r);return t},r.buf2string=function(e,t){var r,n,i,s,o=t||e.length,a=new Array(2*o);for(r=n=0;r<o;)if((i=e[r++])<128)a[n++]=i;else if(4<(s=u[i]))a[n++]=65533,r+=s-1;else{for(i&=2===s?31:3===s?15:7;1<s&&r<o;)i=i<<6|63&e[r++],s--;1<s?a[n++]=65533:i<65536?a[n++]=i:(i-=65536,a[n++]=55296|i>>10&1023,a[n++]=56320|1023&i)}return d(a,n)},r.utf8border=function(e,t){var r;for((t=t||e.length)>e.length&&(t=e.length),r=t-1;0<=r&&128==(192&e[r]);)r--;return r<0?t:0===r?t:r+u[e[r]]>t?r:t}},{"./common":41}],43:[function(e,t,r){"use strict";t.exports=function(e,t,r,n){for(var i=65535&e|0,s=e>>>16&65535|0,o=0;0!==r;){for(r-=o=2e3<r?2e3:r;s=s+(i=i+t[n++]|0)|0,--o;);i%=65521,s%=65521}return i|s<<16|0}},{}],44:[function(e,t,r){"use strict";t.exports={Z_NO_FLUSH:0,Z_PARTIAL_FLUSH:1,Z_SYNC_FLUSH:2,Z_FULL_FLUSH:3,Z_FINISH:4,Z_BLOCK:5,Z_TREES:6,Z_OK:0,Z_STREAM_END:1,Z_NEED_DICT:2,Z_ERRNO:-1,Z_STREAM_ERROR:-2,Z_DATA_ERROR:-3,Z_BUF_ERROR:-5,Z_NO_COMPRESSION:0,Z_BEST_SPEED:1,Z_BEST_COMPRESSION:9,Z_DEFAULT_COMPRESSION:-1,Z_FILTERED:1,Z_HUFFMAN_ONLY:2,Z_RLE:3,Z_FIXED:4,Z_DEFAULT_STRATEGY:0,Z_BINARY:0,Z_TEXT:1,Z_UNKNOWN:2,Z_DEFLATED:8}},{}],45:[function(e,t,r){"use strict";var a=function(){for(var e,t=[],r=0;r<256;r++){e=r;for(var n=0;n<8;n++)e=1&e?3988292384^e>>>1:e>>>1;t[r]=e}return t}();t.exports=function(e,t,r,n){var i=a,s=n+r;e^=-1;for(var o=n;o<s;o++)e=e>>>8^i[255&(e^t[o])];return-1^e}},{}],46:[function(e,t,r){"use strict";var f,l=e("../utils/common"),u=e("./trees"),c=e("./adler32"),p=e("./crc32"),n=e("./messages"),d=0,h=0,m=-2,i=2,_=8,s=286,o=30,a=19,w=2*s+1,v=15,g=3,y=258,b=y+g+1,k=42,x=113;function S(e,t){return e.msg=n[t],t}function E(e){return(e<<1)-(4<e?9:0)}function z(e){for(var t=e.length;0<=--t;)e[t]=0}function C(e){var t=e.state,r=t.pending;r>e.avail_out&&(r=e.avail_out),0!==r&&(l.arraySet(e.output,t.pending_buf,t.pending_out,r,e.next_out),e.next_out+=r,t.pending_out+=r,e.total_out+=r,e.avail_out-=r,t.pending-=r,0===t.pending&&(t.pending_out=0))}function A(e,t){u._tr_flush_block(e,0<=e.block_start?e.block_start:-1,e.strstart-e.block_start,t),e.block_start=e.strstart,C(e.strm)}function O(e,t){e.pending_buf[e.pending++]=t}function I(e,t){e.pending_buf[e.pending++]=t>>>8&255,e.pending_buf[e.pending++]=255&t}function D(e,t){var r,n,i=e.max_chain_length,s=e.strstart,o=e.prev_length,a=e.nice_match,f=e.strstart>e.w_size-b?e.strstart-(e.w_size-b):0,u=e.window,d=e.w_mask,h=e.prev,l=e.strstart+y,c=u[s+o-1],p=u[s+o];e.prev_length>=e.good_match&&(i>>=2),a>e.lookahead&&(a=e.lookahead);do{if(u[(r=t)+o]===p&&u[r+o-1]===c&&u[r]===u[s]&&u[++r]===u[s+1]){s+=2,r++;do{}while(u[++s]===u[++r]&&u[++s]===u[++r]&&u[++s]===u[++r]&&u[++s]===u[++r]&&u[++s]===u[++r]&&u[++s]===u[++r]&&u[++s]===u[++r]&&u[++s]===u[++r]&&s<l);if(n=y-(l-s),s=l-y,o<n){if(e.match_start=t,a<=(o=n))break;c=u[s+o-1],p=u[s+o]}}}while((t=h[t&d])>f&&0!=--i);return o<=e.lookahead?o:e.lookahead}function B(e){var t,r,n,i,s,o,a,f,u,d,h=e.w_size;do{if(i=e.window_size-e.lookahead-e.strstart,e.strstart>=h+(h-b)){for(l.arraySet(e.window,e.window,h,h,0),e.match_start-=h,e.strstart-=h,e.block_start-=h,t=r=e.hash_size;n=e.head[--t],e.head[t]=h<=n?n-h:0,--r;);for(t=r=h;n=e.prev[--t],e.prev[t]=h<=n?n-h:0,--r;);i+=h}if(0===e.strm.avail_in)break;if(o=e.strm,a=e.window,f=e.strstart+e.lookahead,d=void 0,(u=i)<(d=o.avail_in)&&(d=u),r=0===d?0:(o.avail_in-=d,l.arraySet(a,o.input,o.next_in,d,f),1===o.state.wrap?o.adler=c(o.adler,a,d,f):2===o.state.wrap&&(o.adler=p(o.adler,a,d,f)),o.next_in+=d,o.total_in+=d,d),e.lookahead+=r,e.lookahead+e.insert>=g)for(s=e.strstart-e.insert,e.ins_h=e.window[s],e.ins_h=(e.ins_h<<e.hash_shift^e.window[s+1])&e.hash_mask;e.insert&&(e.ins_h=(e.ins_h<<e.hash_shift^e.window[s+g-1])&e.hash_mask,e.prev[s&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=s,s++,e.insert--,!(e.lookahead+e.insert<g)););}while(e.lookahead<b&&0!==e.strm.avail_in)}function T(e,t){for(var r,n;;){if(e.lookahead<b){if(B(e),e.lookahead<b&&t===d)return 1;if(0===e.lookahead)break}if(r=0,e.lookahead>=g&&(e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+g-1])&e.hash_mask,r=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart),0!==r&&e.strstart-r<=e.w_size-b&&(e.match_length=D(e,r)),e.match_length>=g)if(n=u._tr_tally(e,e.strstart-e.match_start,e.match_length-g),e.lookahead-=e.match_length,e.match_length<=e.max_lazy_match&&e.lookahead>=g){for(e.match_length--;e.strstart++,e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+g-1])&e.hash_mask,r=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart,0!=--e.match_length;);e.strstart++}else e.strstart+=e.match_length,e.match_length=0,e.ins_h=e.window[e.strstart],e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+1])&e.hash_mask;else n=u._tr_tally(e,0,e.window[e.strstart]),e.lookahead--,e.strstart++;if(n&&(A(e,!1),0===e.strm.avail_out))return 1}return e.insert=e.strstart<g-1?e.strstart:g-1,4===t?(A(e,!0),0===e.strm.avail_out?3:4):e.last_lit&&(A(e,!1),0===e.strm.avail_out)?1:2}function R(e,t){for(var r,n,i;;){if(e.lookahead<b){if(B(e),e.lookahead<b&&t===d)return 1;if(0===e.lookahead)break}if(r=0,e.lookahead>=g&&(e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+g-1])&e.hash_mask,r=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart),e.prev_length=e.match_length,e.prev_match=e.match_start,e.match_length=g-1,0!==r&&e.prev_length<e.max_lazy_match&&e.strstart-r<=e.w_size-b&&(e.match_length=D(e,r),e.match_length<=5&&(1===e.strategy||e.match_length===g&&4096<e.strstart-e.match_start)&&(e.match_length=g-1)),e.prev_length>=g&&e.match_length<=e.prev_length){for(i=e.strstart+e.lookahead-g,n=u._tr_tally(e,e.strstart-1-e.prev_match,e.prev_length-g),e.lookahead-=e.prev_length-1,e.prev_length-=2;++e.strstart<=i&&(e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+g-1])&e.hash_mask,r=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart),0!=--e.prev_length;);if(e.match_available=0,e.match_length=g-1,e.strstart++,n&&(A(e,!1),0===e.strm.avail_out))return 1}else if(e.match_available){if((n=u._tr_tally(e,0,e.window[e.strstart-1]))&&A(e,!1),e.strstart++,e.lookahead--,0===e.strm.avail_out)return 1}else e.match_available=1,e.strstart++,e.lookahead--}return e.match_available&&(n=u._tr_tally(e,0,e.window[e.strstart-1]),e.match_available=0),e.insert=e.strstart<g-1?e.strstart:g-1,4===t?(A(e,!0),0===e.strm.avail_out?3:4):e.last_lit&&(A(e,!1),0===e.strm.avail_out)?1:2}function F(e,t,r,n,i){this.good_length=e,this.max_lazy=t,this.nice_length=r,this.max_chain=n,this.func=i}function N(){this.strm=null,this.status=0,this.pending_buf=null,this.pending_buf_size=0,this.pending_out=0,this.pending=0,this.wrap=0,this.gzhead=null,this.gzindex=0,this.method=_,this.last_flush=-1,this.w_size=0,this.w_bits=0,this.w_mask=0,this.window=null,this.window_size=0,this.prev=null,this.head=null,this.ins_h=0,this.hash_size=0,this.hash_bits=0,this.hash_mask=0,this.hash_shift=0,this.block_start=0,this.match_length=0,this.prev_match=0,this.match_available=0,this.strstart=0,this.match_start=0,this.lookahead=0,this.prev_length=0,this.max_chain_length=0,this.max_lazy_match=0,this.level=0,this.strategy=0,this.good_match=0,this.nice_match=0,this.dyn_ltree=new l.Buf16(2*w),this.dyn_dtree=new l.Buf16(2*(2*o+1)),this.bl_tree=new l.Buf16(2*(2*a+1)),z(this.dyn_ltree),z(this.dyn_dtree),z(this.bl_tree),this.l_desc=null,this.d_desc=null,this.bl_desc=null,this.bl_count=new l.Buf16(v+1),this.heap=new l.Buf16(2*s+1),z(this.heap),this.heap_len=0,this.heap_max=0,this.depth=new l.Buf16(2*s+1),z(this.depth),this.l_buf=0,this.lit_bufsize=0,this.last_lit=0,this.d_buf=0,this.opt_len=0,this.static_len=0,this.matches=0,this.insert=0,this.bi_buf=0,this.bi_valid=0}function U(e){var t;return e&&e.state?(e.total_in=e.total_out=0,e.data_type=i,(t=e.state).pending=0,t.pending_out=0,t.wrap<0&&(t.wrap=-t.wrap),t.status=t.wrap?k:x,e.adler=2===t.wrap?0:1,t.last_flush=d,u._tr_init(t),h):S(e,m)}function L(e){var t,r=U(e);return r===h&&((t=e.state).window_size=2*t.w_size,z(t.head),t.max_lazy_match=f[t.level].max_lazy,t.good_match=f[t.level].good_length,t.nice_match=f[t.level].nice_length,t.max_chain_length=f[t.level].max_chain,t.strstart=0,t.block_start=0,t.lookahead=0,t.insert=0,t.match_length=t.prev_length=g-1,t.match_available=0,t.ins_h=0),r}function P(e,t,r,n,i,s){if(!e)return m;var o=1;if(-1===t&&(t=6),n<0?(o=0,n=-n):15<n&&(o=2,n-=16),i<1||9<i||r!==_||n<8||15<n||t<0||9<t||s<0||4<s)return S(e,m);8===n&&(n=9);var a=new N;return(e.state=a).strm=e,a.wrap=o,a.gzhead=null,a.w_bits=n,a.w_size=1<<a.w_bits,a.w_mask=a.w_size-1,a.hash_bits=i+7,a.hash_size=1<<a.hash_bits,a.hash_mask=a.hash_size-1,a.hash_shift=~~((a.hash_bits+g-1)/g),a.window=new l.Buf8(2*a.w_size),a.head=new l.Buf16(a.hash_size),a.prev=new l.Buf16(a.w_size),a.lit_bufsize=1<<i+6,a.pending_buf_size=4*a.lit_bufsize,a.pending_buf=new l.Buf8(a.pending_buf_size),a.d_buf=1*a.lit_bufsize,a.l_buf=3*a.lit_bufsize,a.level=t,a.strategy=s,a.method=r,L(e)}f=[new F(0,0,0,0,function(e,t){var r=65535;for(r>e.pending_buf_size-5&&(r=e.pending_buf_size-5);;){if(e.lookahead<=1){if(B(e),0===e.lookahead&&t===d)return 1;if(0===e.lookahead)break}e.strstart+=e.lookahead,e.lookahead=0;var n=e.block_start+r;if((0===e.strstart||e.strstart>=n)&&(e.lookahead=e.strstart-n,e.strstart=n,A(e,!1),0===e.strm.avail_out))return 1;if(e.strstart-e.block_start>=e.w_size-b&&(A(e,!1),0===e.strm.avail_out))return 1}return e.insert=0,4===t?(A(e,!0),0===e.strm.avail_out?3:4):(e.strstart>e.block_start&&(A(e,!1),e.strm.avail_out),1)}),new F(4,4,8,4,T),new F(4,5,16,8,T),new F(4,6,32,32,T),new F(4,4,16,16,R),new F(8,16,32,32,R),new F(8,16,128,128,R),new F(8,32,128,256,R),new F(32,128,258,1024,R),new F(32,258,258,4096,R)],r.deflateInit=function(e,t){return P(e,t,_,15,8,0)},r.deflateInit2=P,r.deflateReset=L,r.deflateResetKeep=U,r.deflateSetHeader=function(e,t){return e&&e.state?2!==e.state.wrap?m:(e.state.gzhead=t,h):m},r.deflate=function(e,t){var r,n,i,s;if(!e||!e.state||5<t||t<0)return e?S(e,m):m;if(n=e.state,!e.output||!e.input&&0!==e.avail_in||666===n.status&&4!==t)return S(e,0===e.avail_out?-5:m);if(n.strm=e,r=n.last_flush,n.last_flush=t,n.status===k)if(2===n.wrap)e.adler=0,O(n,31),O(n,139),O(n,8),n.gzhead?(O(n,(n.gzhead.text?1:0)+(n.gzhead.hcrc?2:0)+(n.gzhead.extra?4:0)+(n.gzhead.name?8:0)+(n.gzhead.comment?16:0)),O(n,255&n.gzhead.time),O(n,n.gzhead.time>>8&255),O(n,n.gzhead.time>>16&255),O(n,n.gzhead.time>>24&255),O(n,9===n.level?2:2<=n.strategy||n.level<2?4:0),O(n,255&n.gzhead.os),n.gzhead.extra&&n.gzhead.extra.length&&(O(n,255&n.gzhead.extra.length),O(n,n.gzhead.extra.length>>8&255)),n.gzhead.hcrc&&(e.adler=p(e.adler,n.pending_buf,n.pending,0)),n.gzindex=0,n.status=69):(O(n,0),O(n,0),O(n,0),O(n,0),O(n,0),O(n,9===n.level?2:2<=n.strategy||n.level<2?4:0),O(n,3),n.status=x);else{var o=_+(n.w_bits-8<<4)<<8;o|=(2<=n.strategy||n.level<2?0:n.level<6?1:6===n.level?2:3)<<6,0!==n.strstart&&(o|=32),o+=31-o%31,n.status=x,I(n,o),0!==n.strstart&&(I(n,e.adler>>>16),I(n,65535&e.adler)),e.adler=1}if(69===n.status)if(n.gzhead.extra){for(i=n.pending;n.gzindex<(65535&n.gzhead.extra.length)&&(n.pending!==n.pending_buf_size||(n.gzhead.hcrc&&n.pending>i&&(e.adler=p(e.adler,n.pending_buf,n.pending-i,i)),C(e),i=n.pending,n.pending!==n.pending_buf_size));)O(n,255&n.gzhead.extra[n.gzindex]),n.gzindex++;n.gzhead.hcrc&&n.pending>i&&(e.adler=p(e.adler,n.pending_buf,n.pending-i,i)),n.gzindex===n.gzhead.extra.length&&(n.gzindex=0,n.status=73)}else n.status=73;if(73===n.status)if(n.gzhead.name){i=n.pending;do{if(n.pending===n.pending_buf_size&&(n.gzhead.hcrc&&n.pending>i&&(e.adler=p(e.adler,n.pending_buf,n.pending-i,i)),C(e),i=n.pending,n.pending===n.pending_buf_size)){s=1;break}s=n.gzindex<n.gzhead.name.length?255&n.gzhead.name.charCodeAt(n.gzindex++):0,O(n,s)}while(0!==s);n.gzhead.hcrc&&n.pending>i&&(e.adler=p(e.adler,n.pending_buf,n.pending-i,i)),0===s&&(n.gzindex=0,n.status=91)}else n.status=91;if(91===n.status)if(n.gzhead.comment){i=n.pending;do{if(n.pending===n.pending_buf_size&&(n.gzhead.hcrc&&n.pending>i&&(e.adler=p(e.adler,n.pending_buf,n.pending-i,i)),C(e),i=n.pending,n.pending===n.pending_buf_size)){s=1;break}s=n.gzindex<n.gzhead.comment.length?255&n.gzhead.comment.charCodeAt(n.gzindex++):0,O(n,s)}while(0!==s);n.gzhead.hcrc&&n.pending>i&&(e.adler=p(e.adler,n.pending_buf,n.pending-i,i)),0===s&&(n.status=103)}else n.status=103;if(103===n.status&&(n.gzhead.hcrc?(n.pending+2>n.pending_buf_size&&C(e),n.pending+2<=n.pending_buf_size&&(O(n,255&e.adler),O(n,e.adler>>8&255),e.adler=0,n.status=x)):n.status=x),0!==n.pending){if(C(e),0===e.avail_out)return n.last_flush=-1,h}else if(0===e.avail_in&&E(t)<=E(r)&&4!==t)return S(e,-5);if(666===n.status&&0!==e.avail_in)return S(e,-5);if(0!==e.avail_in||0!==n.lookahead||t!==d&&666!==n.status){var a=2===n.strategy?function(e,t){for(var r;;){if(0===e.lookahead&&(B(e),0===e.lookahead)){if(t===d)return 1;break}if(e.match_length=0,r=u._tr_tally(e,0,e.window[e.strstart]),e.lookahead--,e.strstart++,r&&(A(e,!1),0===e.strm.avail_out))return 1}return e.insert=0,4===t?(A(e,!0),0===e.strm.avail_out?3:4):e.last_lit&&(A(e,!1),0===e.strm.avail_out)?1:2}(n,t):3===n.strategy?function(e,t){for(var r,n,i,s,o=e.window;;){if(e.lookahead<=y){if(B(e),e.lookahead<=y&&t===d)return 1;if(0===e.lookahead)break}if(e.match_length=0,e.lookahead>=g&&0<e.strstart&&(n=o[i=e.strstart-1])===o[++i]&&n===o[++i]&&n===o[++i]){s=e.strstart+y;do{}while(n===o[++i]&&n===o[++i]&&n===o[++i]&&n===o[++i]&&n===o[++i]&&n===o[++i]&&n===o[++i]&&n===o[++i]&&i<s);e.match_length=y-(s-i),e.match_length>e.lookahead&&(e.match_length=e.lookahead)}if(e.match_length>=g?(r=u._tr_tally(e,1,e.match_length-g),e.lookahead-=e.match_length,e.strstart+=e.match_length,e.match_length=0):(r=u._tr_tally(e,0,e.window[e.strstart]),e.lookahead--,e.strstart++),r&&(A(e,!1),0===e.strm.avail_out))return 1}return e.insert=0,4===t?(A(e,!0),0===e.strm.avail_out?3:4):e.last_lit&&(A(e,!1),0===e.strm.avail_out)?1:2}(n,t):f[n.level].func(n,t);if(3!==a&&4!==a||(n.status=666),1===a||3===a)return 0===e.avail_out&&(n.last_flush=-1),h;if(2===a&&(1===t?u._tr_align(n):5!==t&&(u._tr_stored_block(n,0,0,!1),3===t&&(z(n.head),0===n.lookahead&&(n.strstart=0,n.block_start=0,n.insert=0))),C(e),0===e.avail_out))return n.last_flush=-1,h}return 4!==t?h:n.wrap<=0?1:(2===n.wrap?(O(n,255&e.adler),O(n,e.adler>>8&255),O(n,e.adler>>16&255),O(n,e.adler>>24&255),O(n,255&e.total_in),O(n,e.total_in>>8&255),O(n,e.total_in>>16&255),O(n,e.total_in>>24&255)):(I(n,e.adler>>>16),I(n,65535&e.adler)),C(e),0<n.wrap&&(n.wrap=-n.wrap),0!==n.pending?h:1)},r.deflateEnd=function(e){var t;return e&&e.state?(t=e.state.status)!==k&&69!==t&&73!==t&&91!==t&&103!==t&&t!==x&&666!==t?S(e,m):(e.state=null,t===x?S(e,-3):h):m},r.deflateSetDictionary=function(e,t){var r,n,i,s,o,a,f,u,d=t.length;if(!e||!e.state)return m;if(2===(s=(r=e.state).wrap)||1===s&&r.status!==k||r.lookahead)return m;for(1===s&&(e.adler=c(e.adler,t,d,0)),r.wrap=0,d>=r.w_size&&(0===s&&(z(r.head),r.strstart=0,r.block_start=0,r.insert=0),u=new l.Buf8(r.w_size),l.arraySet(u,t,d-r.w_size,r.w_size,0),t=u,d=r.w_size),o=e.avail_in,a=e.next_in,f=e.input,e.avail_in=d,e.next_in=0,e.input=t,B(r);r.lookahead>=g;){for(n=r.strstart,i=r.lookahead-(g-1);r.ins_h=(r.ins_h<<r.hash_shift^r.window[n+g-1])&r.hash_mask,r.prev[n&r.w_mask]=r.head[r.ins_h],r.head[r.ins_h]=n,n++,--i;);r.strstart=n,r.lookahead=g-1,B(r)}return r.strstart+=r.lookahead,r.block_start=r.strstart,r.insert=r.lookahead,r.lookahead=0,r.match_length=r.prev_length=g-1,r.match_available=0,e.next_in=a,e.input=f,e.avail_in=o,r.wrap=s,h},r.deflateInfo="pako deflate (from Nodeca project)"},{"../utils/common":41,"./adler32":43,"./crc32":45,"./messages":51,"./trees":52}],47:[function(e,t,r){"use strict";t.exports=function(){this.text=0,this.time=0,this.xflags=0,this.os=0,this.extra=null,this.extra_len=0,this.name="",this.comment="",this.hcrc=0,this.done=!1}},{}],48:[function(e,t,r){"use strict";t.exports=function(e,t){var r,n,i,s,o,a,f,u,d,h,l,c,p,m,_,w,v,g,y,b,k,x,S,E,z;r=e.state,n=e.next_in,E=e.input,i=n+(e.avail_in-5),s=e.next_out,z=e.output,o=s-(t-e.avail_out),a=s+(e.avail_out-257),f=r.dmax,u=r.wsize,d=r.whave,h=r.wnext,l=r.window,c=r.hold,p=r.bits,m=r.lencode,_=r.distcode,w=(1<<r.lenbits)-1,v=(1<<r.distbits)-1;e:do{p<15&&(c+=E[n++]<<p,p+=8,c+=E[n++]<<p,p+=8),g=m[c&w];t:for(;;){if(c>>>=y=g>>>24,p-=y,0==(y=g>>>16&255))z[s++]=65535&g;else{if(!(16&y)){if(0==(64&y)){g=m[(65535&g)+(c&(1<<y)-1)];continue t}if(32&y){r.mode=12;break e}e.msg="invalid literal/length code",r.mode=30;break e}b=65535&g,(y&=15)&&(p<y&&(c+=E[n++]<<p,p+=8),b+=c&(1<<y)-1,c>>>=y,p-=y),p<15&&(c+=E[n++]<<p,p+=8,c+=E[n++]<<p,p+=8),g=_[c&v];r:for(;;){if(c>>>=y=g>>>24,p-=y,!(16&(y=g>>>16&255))){if(0==(64&y)){g=_[(65535&g)+(c&(1<<y)-1)];continue r}e.msg="invalid distance code",r.mode=30;break e}if(k=65535&g,p<(y&=15)&&(c+=E[n++]<<p,(p+=8)<y&&(c+=E[n++]<<p,p+=8)),f<(k+=c&(1<<y)-1)){e.msg="invalid distance too far back",r.mode=30;break e}if(c>>>=y,p-=y,(y=s-o)<k){if(d<(y=k-y)&&r.sane){e.msg="invalid distance too far back",r.mode=30;break e}if(S=l,(x=0)===h){if(x+=u-y,y<b){for(b-=y;z[s++]=l[x++],--y;);x=s-k,S=z}}else if(h<y){if(x+=u+h-y,(y-=h)<b){for(b-=y;z[s++]=l[x++],--y;);if(x=0,h<b){for(b-=y=h;z[s++]=l[x++],--y;);x=s-k,S=z}}}else if(x+=h-y,y<b){for(b-=y;z[s++]=l[x++],--y;);x=s-k,S=z}for(;2<b;)z[s++]=S[x++],z[s++]=S[x++],z[s++]=S[x++],b-=3;b&&(z[s++]=S[x++],1<b&&(z[s++]=S[x++]))}else{for(x=s-k;z[s++]=z[x++],z[s++]=z[x++],z[s++]=z[x++],2<(b-=3););b&&(z[s++]=z[x++],1<b&&(z[s++]=z[x++]))}break}}break}}while(n<i&&s<a);n-=b=p>>3,c&=(1<<(p-=b<<3))-1,e.next_in=n,e.next_out=s,e.avail_in=n<i?i-n+5:5-(n-i),e.avail_out=s<a?a-s+257:257-(s-a),r.hold=c,r.bits=p}},{}],49:[function(e,t,r){"use strict";var O=e("../utils/common"),I=e("./adler32"),D=e("./crc32"),B=e("./inffast"),T=e("./inftrees"),R=1,F=2,N=0,U=-2,L=1,n=852,i=592;function P(e){return(e>>>24&255)+(e>>>8&65280)+((65280&e)<<8)+((255&e)<<24)}function s(){this.mode=0,this.last=!1,this.wrap=0,this.havedict=!1,this.flags=0,this.dmax=0,this.check=0,this.total=0,this.head=null,this.wbits=0,this.wsize=0,this.whave=0,this.wnext=0,this.window=null,this.hold=0,this.bits=0,this.length=0,this.offset=0,this.extra=0,this.lencode=null,this.distcode=null,this.lenbits=0,this.distbits=0,this.ncode=0,this.nlen=0,this.ndist=0,this.have=0,this.next=null,this.lens=new O.Buf16(320),this.work=new O.Buf16(288),this.lendyn=null,this.distdyn=null,this.sane=0,this.back=0,this.was=0}function o(e){var t;return e&&e.state?(t=e.state,e.total_in=e.total_out=t.total=0,e.msg="",t.wrap&&(e.adler=1&t.wrap),t.mode=L,t.last=0,t.havedict=0,t.dmax=32768,t.head=null,t.hold=0,t.bits=0,t.lencode=t.lendyn=new O.Buf32(n),t.distcode=t.distdyn=new O.Buf32(i),t.sane=1,t.back=-1,N):U}function a(e){var t;return e&&e.state?((t=e.state).wsize=0,t.whave=0,t.wnext=0,o(e)):U}function f(e,t){var r,n;return e&&e.state?(n=e.state,t<0?(r=0,t=-t):(r=1+(t>>4),t<48&&(t&=15)),t&&(t<8||15<t)?U:(null!==n.window&&n.wbits!==t&&(n.window=null),n.wrap=r,n.wbits=t,a(e))):U}function u(e,t){var r,n;return e?(n=new s,(e.state=n).window=null,(r=f(e,t))!==N&&(e.state=null),r):U}var d,h,l=!0;function j(e){if(l){var t;for(d=new O.Buf32(512),h=new O.Buf32(32),t=0;t<144;)e.lens[t++]=8;for(;t<256;)e.lens[t++]=9;for(;t<280;)e.lens[t++]=7;for(;t<288;)e.lens[t++]=8;for(T(R,e.lens,0,288,d,0,e.work,{bits:9}),t=0;t<32;)e.lens[t++]=5;T(F,e.lens,0,32,h,0,e.work,{bits:5}),l=!1}e.lencode=d,e.lenbits=9,e.distcode=h,e.distbits=5}function Z(e,t,r,n){var i,s=e.state;return null===s.window&&(s.wsize=1<<s.wbits,s.wnext=0,s.whave=0,s.window=new O.Buf8(s.wsize)),n>=s.wsize?(O.arraySet(s.window,t,r-s.wsize,s.wsize,0),s.wnext=0,s.whave=s.wsize):(n<(i=s.wsize-s.wnext)&&(i=n),O.arraySet(s.window,t,r-n,i,s.wnext),(n-=i)?(O.arraySet(s.window,t,r-n,n,0),s.wnext=n,s.whave=s.wsize):(s.wnext+=i,s.wnext===s.wsize&&(s.wnext=0),s.whave<s.wsize&&(s.whave+=i))),0}r.inflateReset=a,r.inflateReset2=f,r.inflateResetKeep=o,r.inflateInit=function(e){return u(e,15)},r.inflateInit2=u,r.inflate=function(e,t){var r,n,i,s,o,a,f,u,d,h,l,c,p,m,_,w,v,g,y,b,k,x,S,E,z=0,C=new O.Buf8(4),A=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];if(!e||!e.state||!e.output||!e.input&&0!==e.avail_in)return U;12===(r=e.state).mode&&(r.mode=13),o=e.next_out,i=e.output,f=e.avail_out,s=e.next_in,n=e.input,a=e.avail_in,u=r.hold,d=r.bits,h=a,l=f,x=N;e:for(;;)switch(r.mode){case L:if(0===r.wrap){r.mode=13;break}for(;d<16;){if(0===a)break e;a--,u+=n[s++]<<d,d+=8}if(2&r.wrap&&35615===u){C[r.check=0]=255&u,C[1]=u>>>8&255,r.check=D(r.check,C,2,0),d=u=0,r.mode=2;break}if(r.flags=0,r.head&&(r.head.done=!1),!(1&r.wrap)||(((255&u)<<8)+(u>>8))%31){e.msg="incorrect header check",r.mode=30;break}if(8!=(15&u)){e.msg="unknown compression method",r.mode=30;break}if(d-=4,k=8+(15&(u>>>=4)),0===r.wbits)r.wbits=k;else if(k>r.wbits){e.msg="invalid window size",r.mode=30;break}r.dmax=1<<k,e.adler=r.check=1,r.mode=512&u?10:12,d=u=0;break;case 2:for(;d<16;){if(0===a)break e;a--,u+=n[s++]<<d,d+=8}if(r.flags=u,8!=(255&r.flags)){e.msg="unknown compression method",r.mode=30;break}if(57344&r.flags){e.msg="unknown header flags set",r.mode=30;break}r.head&&(r.head.text=u>>8&1),512&r.flags&&(C[0]=255&u,C[1]=u>>>8&255,r.check=D(r.check,C,2,0)),d=u=0,r.mode=3;case 3:for(;d<32;){if(0===a)break e;a--,u+=n[s++]<<d,d+=8}r.head&&(r.head.time=u),512&r.flags&&(C[0]=255&u,C[1]=u>>>8&255,C[2]=u>>>16&255,C[3]=u>>>24&255,r.check=D(r.check,C,4,0)),d=u=0,r.mode=4;case 4:for(;d<16;){if(0===a)break e;a--,u+=n[s++]<<d,d+=8}r.head&&(r.head.xflags=255&u,r.head.os=u>>8),512&r.flags&&(C[0]=255&u,C[1]=u>>>8&255,r.check=D(r.check,C,2,0)),d=u=0,r.mode=5;case 5:if(1024&r.flags){for(;d<16;){if(0===a)break e;a--,u+=n[s++]<<d,d+=8}r.length=u,r.head&&(r.head.extra_len=u),512&r.flags&&(C[0]=255&u,C[1]=u>>>8&255,r.check=D(r.check,C,2,0)),d=u=0}else r.head&&(r.head.extra=null);r.mode=6;case 6:if(1024&r.flags&&(a<(c=r.length)&&(c=a),c&&(r.head&&(k=r.head.extra_len-r.length,r.head.extra||(r.head.extra=new Array(r.head.extra_len)),O.arraySet(r.head.extra,n,s,c,k)),512&r.flags&&(r.check=D(r.check,n,c,s)),a-=c,s+=c,r.length-=c),r.length))break e;r.length=0,r.mode=7;case 7:if(2048&r.flags){if(0===a)break e;for(c=0;k=n[s+c++],r.head&&k&&r.length<65536&&(r.head.name+=String.fromCharCode(k)),k&&c<a;);if(512&r.flags&&(r.check=D(r.check,n,c,s)),a-=c,s+=c,k)break e}else r.head&&(r.head.name=null);r.length=0,r.mode=8;case 8:if(4096&r.flags){if(0===a)break e;for(c=0;k=n[s+c++],r.head&&k&&r.length<65536&&(r.head.comment+=String.fromCharCode(k)),k&&c<a;);if(512&r.flags&&(r.check=D(r.check,n,c,s)),a-=c,s+=c,k)break e}else r.head&&(r.head.comment=null);r.mode=9;case 9:if(512&r.flags){for(;d<16;){if(0===a)break e;a--,u+=n[s++]<<d,d+=8}if(u!==(65535&r.check)){e.msg="header crc mismatch",r.mode=30;break}d=u=0}r.head&&(r.head.hcrc=r.flags>>9&1,r.head.done=!0),e.adler=r.check=0,r.mode=12;break;case 10:for(;d<32;){if(0===a)break e;a--,u+=n[s++]<<d,d+=8}e.adler=r.check=P(u),d=u=0,r.mode=11;case 11:if(0===r.havedict)return e.next_out=o,e.avail_out=f,e.next_in=s,e.avail_in=a,r.hold=u,r.bits=d,2;e.adler=r.check=1,r.mode=12;case 12:if(5===t||6===t)break e;case 13:if(r.last){u>>>=7&d,d-=7&d,r.mode=27;break}for(;d<3;){if(0===a)break e;a--,u+=n[s++]<<d,d+=8}switch(r.last=1&u,d-=1,3&(u>>>=1)){case 0:r.mode=14;break;case 1:if(j(r),r.mode=20,6!==t)break;u>>>=2,d-=2;break e;case 2:r.mode=17;break;case 3:e.msg="invalid block type",r.mode=30}u>>>=2,d-=2;break;case 14:for(u>>>=7&d,d-=7&d;d<32;){if(0===a)break e;a--,u+=n[s++]<<d,d+=8}if((65535&u)!=(u>>>16^65535)){e.msg="invalid stored block lengths",r.mode=30;break}if(r.length=65535&u,d=u=0,r.mode=15,6===t)break e;case 15:r.mode=16;case 16:if(c=r.length){if(a<c&&(c=a),f<c&&(c=f),0===c)break e;O.arraySet(i,n,s,c,o),a-=c,s+=c,f-=c,o+=c,r.length-=c;break}r.mode=12;break;case 17:for(;d<14;){if(0===a)break e;a--,u+=n[s++]<<d,d+=8}if(r.nlen=257+(31&u),u>>>=5,d-=5,r.ndist=1+(31&u),u>>>=5,d-=5,r.ncode=4+(15&u),u>>>=4,d-=4,286<r.nlen||30<r.ndist){e.msg="too many length or distance symbols",r.mode=30;break}r.have=0,r.mode=18;case 18:for(;r.have<r.ncode;){for(;d<3;){if(0===a)break e;a--,u+=n[s++]<<d,d+=8}r.lens[A[r.have++]]=7&u,u>>>=3,d-=3}for(;r.have<19;)r.lens[A[r.have++]]=0;if(r.lencode=r.lendyn,r.lenbits=7,S={bits:r.lenbits},x=T(0,r.lens,0,19,r.lencode,0,r.work,S),r.lenbits=S.bits,x){e.msg="invalid code lengths set",r.mode=30;break}r.have=0,r.mode=19;case 19:for(;r.have<r.nlen+r.ndist;){for(;w=(z=r.lencode[u&(1<<r.lenbits)-1])>>>16&255,v=65535&z,!((_=z>>>24)<=d);){if(0===a)break e;a--,u+=n[s++]<<d,d+=8}if(v<16)u>>>=_,d-=_,r.lens[r.have++]=v;else{if(16===v){for(E=_+2;d<E;){if(0===a)break e;a--,u+=n[s++]<<d,d+=8}if(u>>>=_,d-=_,0===r.have){e.msg="invalid bit length repeat",r.mode=30;break}k=r.lens[r.have-1],c=3+(3&u),u>>>=2,d-=2}else if(17===v){for(E=_+3;d<E;){if(0===a)break e;a--,u+=n[s++]<<d,d+=8}d-=_,k=0,c=3+(7&(u>>>=_)),u>>>=3,d-=3}else{for(E=_+7;d<E;){if(0===a)break e;a--,u+=n[s++]<<d,d+=8}d-=_,k=0,c=11+(127&(u>>>=_)),u>>>=7,d-=7}if(r.have+c>r.nlen+r.ndist){e.msg="invalid bit length repeat",r.mode=30;break}for(;c--;)r.lens[r.have++]=k}}if(30===r.mode)break;if(0===r.lens[256]){e.msg="invalid code -- missing end-of-block",r.mode=30;break}if(r.lenbits=9,S={bits:r.lenbits},x=T(R,r.lens,0,r.nlen,r.lencode,0,r.work,S),r.lenbits=S.bits,x){e.msg="invalid literal/lengths set",r.mode=30;break}if(r.distbits=6,r.distcode=r.distdyn,S={bits:r.distbits},x=T(F,r.lens,r.nlen,r.ndist,r.distcode,0,r.work,S),r.distbits=S.bits,x){e.msg="invalid distances set",r.mode=30;break}if(r.mode=20,6===t)break e;case 20:r.mode=21;case 21:if(6<=a&&258<=f){e.next_out=o,e.avail_out=f,e.next_in=s,e.avail_in=a,r.hold=u,r.bits=d,B(e,l),o=e.next_out,i=e.output,f=e.avail_out,s=e.next_in,n=e.input,a=e.avail_in,u=r.hold,d=r.bits,12===r.mode&&(r.back=-1);break}for(r.back=0;w=(z=r.lencode[u&(1<<r.lenbits)-1])>>>16&255,v=65535&z,!((_=z>>>24)<=d);){if(0===a)break e;a--,u+=n[s++]<<d,d+=8}if(w&&0==(240&w)){for(g=_,y=w,b=v;w=(z=r.lencode[b+((u&(1<<g+y)-1)>>g)])>>>16&255,v=65535&z,!(g+(_=z>>>24)<=d);){if(0===a)break e;a--,u+=n[s++]<<d,d+=8}u>>>=g,d-=g,r.back+=g}if(u>>>=_,d-=_,r.back+=_,r.length=v,0===w){r.mode=26;break}if(32&w){r.back=-1,r.mode=12;break}if(64&w){e.msg="invalid literal/length code",r.mode=30;break}r.extra=15&w,r.mode=22;case 22:if(r.extra){for(E=r.extra;d<E;){if(0===a)break e;a--,u+=n[s++]<<d,d+=8}r.length+=u&(1<<r.extra)-1,u>>>=r.extra,d-=r.extra,r.back+=r.extra}r.was=r.length,r.mode=23;case 23:for(;w=(z=r.distcode[u&(1<<r.distbits)-1])>>>16&255,v=65535&z,!((_=z>>>24)<=d);){if(0===a)break e;a--,u+=n[s++]<<d,d+=8}if(0==(240&w)){for(g=_,y=w,b=v;w=(z=r.distcode[b+((u&(1<<g+y)-1)>>g)])>>>16&255,v=65535&z,!(g+(_=z>>>24)<=d);){if(0===a)break e;a--,u+=n[s++]<<d,d+=8}u>>>=g,d-=g,r.back+=g}if(u>>>=_,d-=_,r.back+=_,64&w){e.msg="invalid distance code",r.mode=30;break}r.offset=v,r.extra=15&w,r.mode=24;case 24:if(r.extra){for(E=r.extra;d<E;){if(0===a)break e;a--,u+=n[s++]<<d,d+=8}r.offset+=u&(1<<r.extra)-1,u>>>=r.extra,d-=r.extra,r.back+=r.extra}if(r.offset>r.dmax){e.msg="invalid distance too far back",r.mode=30;break}r.mode=25;case 25:if(0===f)break e;if(c=l-f,r.offset>c){if((c=r.offset-c)>r.whave&&r.sane){e.msg="invalid distance too far back",r.mode=30;break}p=c>r.wnext?(c-=r.wnext,r.wsize-c):r.wnext-c,c>r.length&&(c=r.length),m=r.window}else m=i,p=o-r.offset,c=r.length;for(f<c&&(c=f),f-=c,r.length-=c;i[o++]=m[p++],--c;);0===r.length&&(r.mode=21);break;case 26:if(0===f)break e;i[o++]=r.length,f--,r.mode=21;break;case 27:if(r.wrap){for(;d<32;){if(0===a)break e;a--,u|=n[s++]<<d,d+=8}if(l-=f,e.total_out+=l,r.total+=l,l&&(e.adler=r.check=r.flags?D(r.check,i,l,o-l):I(r.check,i,l,o-l)),l=f,(r.flags?u:P(u))!==r.check){e.msg="incorrect data check",r.mode=30;break}d=u=0}r.mode=28;case 28:if(r.wrap&&r.flags){for(;d<32;){if(0===a)break e;a--,u+=n[s++]<<d,d+=8}if(u!==(4294967295&r.total)){e.msg="incorrect length check",r.mode=30;break}d=u=0}r.mode=29;case 29:x=1;break e;case 30:x=-3;break e;case 31:return-4;case 32:default:return U}return e.next_out=o,e.avail_out=f,e.next_in=s,e.avail_in=a,r.hold=u,r.bits=d,(r.wsize||l!==e.avail_out&&r.mode<30&&(r.mode<27||4!==t))&&Z(e,e.output,e.next_out,l-e.avail_out)?(r.mode=31,-4):(h-=e.avail_in,l-=e.avail_out,e.total_in+=h,e.total_out+=l,r.total+=l,r.wrap&&l&&(e.adler=r.check=r.flags?D(r.check,i,l,e.next_out-l):I(r.check,i,l,e.next_out-l)),e.data_type=r.bits+(r.last?64:0)+(12===r.mode?128:0)+(20===r.mode||15===r.mode?256:0),(0==h&&0===l||4===t)&&x===N&&(x=-5),x)},r.inflateEnd=function(e){if(!e||!e.state)return U;var t=e.state;return t.window&&(t.window=null),e.state=null,N},r.inflateGetHeader=function(e,t){var r;return e&&e.state?0==(2&(r=e.state).wrap)?U:((r.head=t).done=!1,N):U},r.inflateSetDictionary=function(e,t){var r,n=t.length;return e&&e.state?0!==(r=e.state).wrap&&11!==r.mode?U:11===r.mode&&I(1,t,n,0)!==r.check?-3:Z(e,t,n,n)?(r.mode=31,-4):(r.havedict=1,N):U},r.inflateInfo="pako inflate (from Nodeca project)"},{"../utils/common":41,"./adler32":43,"./crc32":45,"./inffast":48,"./inftrees":50}],50:[function(e,t,r){"use strict";var R=e("../utils/common"),F=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,0,0],N=[16,16,16,16,16,16,16,16,17,17,17,17,18,18,18,18,19,19,19,19,20,20,20,20,21,21,21,21,16,72,78],U=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577,0,0],L=[16,16,16,16,17,17,18,18,19,19,20,20,21,21,22,22,23,23,24,24,25,25,26,26,27,27,28,28,29,29,64,64];t.exports=function(e,t,r,n,i,s,o,a){var f,u,d,h,l,c,p,m,_,w=a.bits,v=0,g=0,y=0,b=0,k=0,x=0,S=0,E=0,z=0,C=0,A=null,O=0,I=new R.Buf16(16),D=new R.Buf16(16),B=null,T=0;for(v=0;v<=15;v++)I[v]=0;for(g=0;g<n;g++)I[t[r+g]]++;for(k=w,b=15;1<=b&&0===I[b];b--);if(b<k&&(k=b),0===b)return i[s++]=20971520,i[s++]=20971520,a.bits=1,0;for(y=1;y<b&&0===I[y];y++);for(k<y&&(k=y),v=E=1;v<=15;v++)if(E<<=1,(E-=I[v])<0)return-1;if(0<E&&(0===e||1!==b))return-1;for(D[1]=0,v=1;v<15;v++)D[v+1]=D[v]+I[v];for(g=0;g<n;g++)0!==t[r+g]&&(o[D[t[r+g]]++]=g);if(c=0===e?(A=B=o,19):1===e?(A=F,O-=257,B=N,T-=257,256):(A=U,B=L,-1),v=y,l=s,S=g=C=0,d=-1,h=(z=1<<(x=k))-1,1===e&&852<z||2===e&&592<z)return 1;for(;;){for(p=v-S,_=o[g]<c?(m=0,o[g]):o[g]>c?(m=B[T+o[g]],A[O+o[g]]):(m=96,0),f=1<<v-S,y=u=1<<x;i[l+(C>>S)+(u-=f)]=p<<24|m<<16|_|0,0!==u;);for(f=1<<v-1;C&f;)f>>=1;if(0!==f?(C&=f-1,C+=f):C=0,g++,0==--I[v]){if(v===b)break;v=t[r+o[g]]}if(k<v&&(C&h)!==d){for(0===S&&(S=k),l+=y,E=1<<(x=v-S);x+S<b&&!((E-=I[x+S])<=0);)x++,E<<=1;if(z+=1<<x,1===e&&852<z||2===e&&592<z)return 1;i[d=C&h]=k<<24|x<<16|l-s|0}}return 0!==C&&(i[l+C]=v-S<<24|64<<16|0),a.bits=k,0}},{"../utils/common":41}],51:[function(e,t,r){"use strict";t.exports={2:"need dictionary",1:"stream end",0:"","-1":"file error","-2":"stream error","-3":"data error","-4":"insufficient memory","-5":"buffer error","-6":"incompatible version"}},{}],52:[function(e,t,r){"use strict";var a=e("../utils/common");function n(e){for(var t=e.length;0<=--t;)e[t]=0}var _=15,i=16,f=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0],u=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13],o=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,7],d=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],h=new Array(576);n(h);var l=new Array(60);n(l);var c=new Array(512);n(c);var p=new Array(256);n(p);var m=new Array(29);n(m);var w,v,g,y=new Array(30);function b(e,t,r,n,i){this.static_tree=e,this.extra_bits=t,this.extra_base=r,this.elems=n,this.max_length=i,this.has_stree=e&&e.length}function s(e,t){this.dyn_tree=e,this.max_code=0,this.stat_desc=t}function k(e){return e<256?c[e]:c[256+(e>>>7)]}function x(e,t){e.pending_buf[e.pending++]=255&t,e.pending_buf[e.pending++]=t>>>8&255}function S(e,t,r){e.bi_valid>i-r?(e.bi_buf|=t<<e.bi_valid&65535,x(e,e.bi_buf),e.bi_buf=t>>i-e.bi_valid,e.bi_valid+=r-i):(e.bi_buf|=t<<e.bi_valid&65535,e.bi_valid+=r)}function E(e,t,r){S(e,r[2*t],r[2*t+1])}function z(e,t){for(var r=0;r|=1&e,e>>>=1,r<<=1,0<--t;);return r>>>1}function C(e,t,r){var n,i,s=new Array(_+1),o=0;for(n=1;n<=_;n++)s[n]=o=o+r[n-1]<<1;for(i=0;i<=t;i++){var a=e[2*i+1];0!==a&&(e[2*i]=z(s[a]++,a))}}function A(e){var t;for(t=0;t<286;t++)e.dyn_ltree[2*t]=0;for(t=0;t<30;t++)e.dyn_dtree[2*t]=0;for(t=0;t<19;t++)e.bl_tree[2*t]=0;e.dyn_ltree[512]=1,e.opt_len=e.static_len=0,e.last_lit=e.matches=0}function O(e){8<e.bi_valid?x(e,e.bi_buf):0<e.bi_valid&&(e.pending_buf[e.pending++]=e.bi_buf),e.bi_buf=0,e.bi_valid=0}function I(e,t,r,n){var i=2*t,s=2*r;return e[i]<e[s]||e[i]===e[s]&&n[t]<=n[r]}function D(e,t,r){for(var n=e.heap[r],i=r<<1;i<=e.heap_len&&(i<e.heap_len&&I(t,e.heap[i+1],e.heap[i],e.depth)&&i++,!I(t,n,e.heap[i],e.depth));)e.heap[r]=e.heap[i],r=i,i<<=1;e.heap[r]=n}function B(e,t,r){var n,i,s,o,a=0;if(0!==e.last_lit)for(;n=e.pending_buf[e.d_buf+2*a]<<8|e.pending_buf[e.d_buf+2*a+1],i=e.pending_buf[e.l_buf+a],a++,0===n?E(e,i,t):(E(e,(s=p[i])+256+1,t),0!==(o=f[s])&&S(e,i-=m[s],o),E(e,s=k(--n),r),0!==(o=u[s])&&S(e,n-=y[s],o)),a<e.last_lit;);E(e,256,t)}function T(e,t){var r,n,i,s=t.dyn_tree,o=t.stat_desc.static_tree,a=t.stat_desc.has_stree,f=t.stat_desc.elems,u=-1;for(e.heap_len=0,e.heap_max=573,r=0;r<f;r++)0!==s[2*r]?(e.heap[++e.heap_len]=u=r,e.depth[r]=0):s[2*r+1]=0;for(;e.heap_len<2;)s[2*(i=e.heap[++e.heap_len]=u<2?++u:0)]=1,e.depth[i]=0,e.opt_len--,a&&(e.static_len-=o[2*i+1]);for(t.max_code=u,r=e.heap_len>>1;1<=r;r--)D(e,s,r);for(i=f;r=e.heap[1],e.heap[1]=e.heap[e.heap_len--],D(e,s,1),n=e.heap[1],e.heap[--e.heap_max]=r,e.heap[--e.heap_max]=n,s[2*i]=s[2*r]+s[2*n],e.depth[i]=(e.depth[r]>=e.depth[n]?e.depth[r]:e.depth[n])+1,s[2*r+1]=s[2*n+1]=i,e.heap[1]=i++,D(e,s,1),2<=e.heap_len;);e.heap[--e.heap_max]=e.heap[1],function(e,t){var r,n,i,s,o,a,f=t.dyn_tree,u=t.max_code,d=t.stat_desc.static_tree,h=t.stat_desc.has_stree,l=t.stat_desc.extra_bits,c=t.stat_desc.extra_base,p=t.stat_desc.max_length,m=0;for(s=0;s<=_;s++)e.bl_count[s]=0;for(f[2*e.heap[e.heap_max]+1]=0,r=e.heap_max+1;r<573;r++)p<(s=f[2*f[2*(n=e.heap[r])+1]+1]+1)&&(s=p,m++),f[2*n+1]=s,u<n||(e.bl_count[s]++,o=0,c<=n&&(o=l[n-c]),a=f[2*n],e.opt_len+=a*(s+o),h&&(e.static_len+=a*(d[2*n+1]+o)));if(0!==m){do{for(s=p-1;0===e.bl_count[s];)s--;e.bl_count[s]--,e.bl_count[s+1]+=2,e.bl_count[p]--,m-=2}while(0<m);for(s=p;0!==s;s--)for(n=e.bl_count[s];0!==n;)u<(i=e.heap[--r])||(f[2*i+1]!==s&&(e.opt_len+=(s-f[2*i+1])*f[2*i],f[2*i+1]=s),n--)}}(e,t),C(s,u,e.bl_count)}function R(e,t,r){var n,i,s=-1,o=t[1],a=0,f=7,u=4;for(0===o&&(f=138,u=3),t[2*(r+1)+1]=65535,n=0;n<=r;n++)i=o,o=t[2*(n+1)+1],++a<f&&i===o||(a<u?e.bl_tree[2*i]+=a:0!==i?(i!==s&&e.bl_tree[2*i]++,e.bl_tree[32]++):a<=10?e.bl_tree[34]++:e.bl_tree[36]++,s=i,u=(a=0)===o?(f=138,3):i===o?(f=6,3):(f=7,4))}function F(e,t,r){var n,i,s=-1,o=t[1],a=0,f=7,u=4;for(0===o&&(f=138,u=3),n=0;n<=r;n++)if(i=o,o=t[2*(n+1)+1],!(++a<f&&i===o)){if(a<u)for(;E(e,i,e.bl_tree),0!=--a;);else 0!==i?(i!==s&&(E(e,i,e.bl_tree),a--),E(e,16,e.bl_tree),S(e,a-3,2)):a<=10?(E(e,17,e.bl_tree),S(e,a-3,3)):(E(e,18,e.bl_tree),S(e,a-11,7));s=i,u=(a=0)===o?(f=138,3):i===o?(f=6,3):(f=7,4)}}n(y);var N=!1;function U(e,t,r,n){var i,s,o;S(e,0+(n?1:0),3),s=t,o=r,O(i=e),x(i,o),x(i,~o),a.arraySet(i.pending_buf,i.window,s,o,i.pending),i.pending+=o}r._tr_init=function(e){N||(function(){var e,t,r,n,i,s=new Array(_+1);for(n=r=0;n<28;n++)for(m[n]=r,e=0;e<1<<f[n];e++)p[r++]=n;for(p[r-1]=n,n=i=0;n<16;n++)for(y[n]=i,e=0;e<1<<u[n];e++)c[i++]=n;for(i>>=7;n<30;n++)for(y[n]=i<<7,e=0;e<1<<u[n]-7;e++)c[256+i++]=n;for(t=0;t<=_;t++)s[t]=0;for(e=0;e<=143;)h[2*e+1]=8,e++,s[8]++;for(;e<=255;)h[2*e+1]=9,e++,s[9]++;for(;e<=279;)h[2*e+1]=7,e++,s[7]++;for(;e<=287;)h[2*e+1]=8,e++,s[8]++;for(C(h,287,s),e=0;e<30;e++)l[2*e+1]=5,l[2*e]=z(e,5);w=new b(h,f,257,286,_),v=new b(l,u,0,30,_),g=new b(new Array(0),o,0,19,7)}(),N=!0),e.l_desc=new s(e.dyn_ltree,w),e.d_desc=new s(e.dyn_dtree,v),e.bl_desc=new s(e.bl_tree,g),e.bi_buf=0,e.bi_valid=0,A(e)},r._tr_stored_block=U,r._tr_flush_block=function(e,t,r,n){var i,s,o=0;0<e.level?(2===e.strm.data_type&&(e.strm.data_type=function(e){var t,r=4093624447;for(t=0;t<=31;t++,r>>>=1)if(1&r&&0!==e.dyn_ltree[2*t])return 0;if(0!==e.dyn_ltree[18]||0!==e.dyn_ltree[20]||0!==e.dyn_ltree[26])return 1;for(t=32;t<256;t++)if(0!==e.dyn_ltree[2*t])return 1;return 0}(e)),T(e,e.l_desc),T(e,e.d_desc),o=function(e){var t;for(R(e,e.dyn_ltree,e.l_desc.max_code),R(e,e.dyn_dtree,e.d_desc.max_code),T(e,e.bl_desc),t=18;3<=t&&0===e.bl_tree[2*d[t]+1];t--);return e.opt_len+=3*(t+1)+5+5+4,t}(e),i=e.opt_len+3+7>>>3,(s=e.static_len+3+7>>>3)<=i&&(i=s)):i=s=r+5,r+4<=i&&-1!==t?U(e,t,r,n):4===e.strategy||s===i?(S(e,2+(n?1:0),3),B(e,h,l)):(S(e,4+(n?1:0),3),function(e,t,r,n){var i;for(S(e,t-257,5),S(e,r-1,5),S(e,n-4,4),i=0;i<n;i++)S(e,e.bl_tree[2*d[i]+1],3);F(e,e.dyn_ltree,t-1),F(e,e.dyn_dtree,r-1)}(e,e.l_desc.max_code+1,e.d_desc.max_code+1,o+1),B(e,e.dyn_ltree,e.dyn_dtree)),A(e),n&&O(e)},r._tr_tally=function(e,t,r){return e.pending_buf[e.d_buf+2*e.last_lit]=t>>>8&255,e.pending_buf[e.d_buf+2*e.last_lit+1]=255&t,e.pending_buf[e.l_buf+e.last_lit]=255&r,e.last_lit++,0===t?e.dyn_ltree[2*r]++:(e.matches++,t--,e.dyn_ltree[2*(p[r]+256+1)]++,e.dyn_dtree[2*k(t)]++),e.last_lit===e.lit_bufsize-1},r._tr_align=function(e){var t;S(e,2,3),E(e,256,h),16===(t=e).bi_valid?(x(t,t.bi_buf),t.bi_buf=0,t.bi_valid=0):8<=t.bi_valid&&(t.pending_buf[t.pending++]=255&t.bi_buf,t.bi_buf>>=8,t.bi_valid-=8)}},{"../utils/common":41}],53:[function(e,t,r){"use strict";t.exports=function(){this.input=null,this.next_in=0,this.avail_in=0,this.total_in=0,this.output=null,this.next_out=0,this.avail_out=0,this.total_out=0,this.msg="",this.state=null,this.data_type=2,this.adler=0}},{}],54:[function(e,t,r){"use strict";t.exports="function"==typeof setImmediate?setImmediate:function(){var e=[].slice.apply(arguments);e.splice(1,0,0),setTimeout.apply(null,e)}},{}]},{},[10])(10)})}).call(this,void 0!==r?r:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}]},{},[1])(1)})}).call(this,void 0!==r?r:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}]},{},[1])(1)})}).call(this,void 0!==r?r:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}]},{},[1])(1)})}).call(this,void 0!==r?r:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}]},{},[1])(1)})}).call(this,void 0!==r?r:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}]},{},[1])(1)})}).call(this,void 0!==r?r:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}]},{},[1])(1)})}).call(this,void 0!==r?r:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}]},{},[1])(1)})}).call(this,void 0!==r?r:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}]},{},[1])(1)})}).call(this,void 0!==r?r:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}]},{},[1])(1)})}).call(this,void 0!==r?r:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}]},{},[1])(1)})}).call(this,void 0!==r?r:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}]},{},[1])(1)})}).call(this,void 0!==r?r:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}]},{},[1])(1)})}).call(this,void 0!==r?r:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}]},{},[1])(1)})}).call(this,void 0!==r?r:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}]},{},[1])(1)})}).call(this,void 0!==r?r:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}]},{},[1])(1)})}).call(this,void 0!==r?r:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}]},{},[1])(1)})}).call(this,"undefined"!=typeof __webpack_require__.g?__webpack_require__.g:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}]},{},[1])(1)});

/***/ }),
/* 32 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BrowserDrawerCanvas = void 0;
const DrawerCanvas_1 = __webpack_require__(8);
const utils_1 = __webpack_require__(16);
/**
 *
 * @category DrawerCanvas
 * @class BrowserDrawerCanvas
 * @extends {DrawerCanvas}
 */
class BrowserDrawerCanvas extends DrawerCanvas_1.DrawerCanvas {
    constructor(scene, canvasOrContainer, drawerOptions, duration = 60000, framerate = 60) {
        super(scene, canvasOrContainer, drawerOptions, duration, framerate);
        this.dpi = 1;
        this.dpi = (drawerOptions === null || drawerOptions === void 0 ? void 0 : drawerOptions.dpi) || 1;
        this.draw_id = null;
        this.redraw_id = null;
        this.animation_id = null;
        this.draw = this.draw.bind(this);
        this.animate = this.animate.bind(this);
        this.startAnimation = this.startAnimation.bind(this);
        this.resize(this.drawerOptions.width, this.drawerOptions.height);
    }
    resize(width, height, sceneFit, dpi = this.dpi) {
        this.drawerOptions.width = width * dpi;
        this.drawerOptions.height = height * dpi;
        if (this.canvas) {
            this.canvas.width = width * dpi;
            this.canvas.height = height * dpi;
            if (utils_1.bBrowser && this.canvas instanceof HTMLCanvasElement) {
                this.canvas.style.width = width + 'px';
                this.canvas.style.height = height + 'px';
            }
        }
        if (typeof sceneFit !== 'undefined') {
            this.drawerOptions.sceneFit = sceneFit;
        }
        this.dispatch('drawer-canvas:resize');
    }
    /**
     * Internal tick animation
     */
    animate(timestamp) {
        if (this.timeline.bSequenceStarted()) {
            this.animation_id = requestAnimationFrame(this.animate);
            if (this.timeline.tick(timestamp))
                this.draw();
        }
    }
    /**
     * Start animation drawing
     */
    startAnimation() {
        this.stopAnimation();
        this.timeline.start();
        this.animation_id = requestAnimationFrame(this.animate);
    }
    /**
     * Stop animation drawing
     */
    stopAnimation() {
        this.timeline.stop();
        if (this.animation_id)
            cancelAnimationFrame(this.animation_id);
    }
    /**
     * Pause animation drawing
     */
    pauseAnimation() {
        this.timeline.pause();
        if (this.animation_id)
            cancelAnimationFrame(this.animation_id);
    }
    /**
     * Play animation drawing
     */
    playAnimation() {
        this.timeline.start();
        requestAnimationFrame(this.animate);
    }
    redraw() {
        if (!this.timeline.bSequenceStarted()) {
            this.draw_id && cancelAnimationFrame(this.draw_id);
            if (typeof this.drawerOptions.ghosts === undefined || this.drawerOptions.ghosts === 0)
                this.timeline.stop();
            this.draw_id = requestAnimationFrame(this.draw);
        }
        else if (typeof this.drawerOptions.ghosts === undefined || this.drawerOptions.ghosts === 0) {
            this.stopAnimation();
            this.redraw_id && cancelAnimationFrame(this.redraw_id);
            this.redraw_id = requestAnimationFrame(this.startAnimation);
        }
    }
}
exports.BrowserDrawerCanvas = BrowserDrawerCanvas;
//# sourceMappingURL=BrowserDrawerCanvas.js.map

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(0);
/******/ 	
/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=urpflanze-drawer-canvas.js.map