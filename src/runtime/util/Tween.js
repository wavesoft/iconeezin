"use strict";
/**
 * Iconeez.in - A Web VR Platform for social experiments
 * Copyright (C) 2015 Ioannis Charalampidis <ioannis.charalampidis@cern.ch>
 * 
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 *
 * @author Ioannis Charalampidis / https://github.com/wavesoft
 */

/**
 * Start a new tween with the given duration
 * and rate.
 * @param {int} duration - Duration in milliseconds
 * @param {int} rate - Events per second
 */
var Tween = function( duration, rate ) {
	this.duration = duration;
	this.rate = rate;

	// Calculate the timer interval
	this._interval = 1000 / rate;
	this._position = 0;
	this._step = 1 / (this.duration / this._interval);

	// The handling functions
	this._stepFunctions = [];
	this._completeFunctions = [];

	// Replacable interval method
	this._handle = null;
	this._setInterval = setInterval.bind(window);
	this._clearInterval = clearInterval.bind(window);

};

/**
 * Dispose function
 */
Tween.prototype.dispose = function() {

	// Free memory
	this._completeFunctions = null;
	this._stepFunctions = null;

	// Clear interval
	if (this._interval) {
		this._clearInterval( this._interval );
		this._interval = null;
	}

}

/**
 * Stop function
 */
Tween.prototype.stop = function() {

	// Reset position
	this._position = 0;

	// Abort previous timer
	if (this._handle) {
		this._clearInterval( this._handle );
		this._handle = null;
	}

}

/**
 * Start function
 */
Tween.prototype.start = function() {

	// Abort previous timer
	if (this._handle) {
		this._clearInterval( this._handle );
		this._handle = null;
	}

	// Schedule function
	this._handle = this._setInterval( (function() {
		this._position += this._step;
		if (this._position >= 1) {

			// Trigger final steps and completion callbacks
			for (var i=0, l=this._stepFunctions.length; i<l; i++) {
				this._stepFunctions[i](1.0);
			}
			for (var i=0, l=this._completeFunctions.length; i<l; i++) {
				this._completeFunctions[i](1.0);
			}

			// Stop timer
			this._clearInterval( this._handle );
			this._handle = null;

		} else {

			// Trigger all step functions
			for (var i=0, l=this._stepFunctions.length; i<l; i++) {
				this._stepFunctions[i](this._position);
			}

		}
	}).bind(this), this._interval );

};

/**
 * Chain a step function
 */
Tween.prototype.step = function( cb ) {
	this._stepFunctions.push(cb);
	return this;
};

/**
 * Chain a complete function
 */
Tween.prototype.completed = function( cb ) {
	this._completeFunctions.push(cb);
	return this;
};

// Export tween
module.exports = Tween;