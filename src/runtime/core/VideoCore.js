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

var Viewport = require("../ui/Viewport");

/**
 * Private properties
 */
var paused = true;
var messageFn = null;
var timeoutTimer = null;
var timeoutVal = 0;

/**
 * The VideoCore singleton contains the
 * global video management API.
 */
var VideoCore = {};

/**
 * Initialize the video core
 */
VideoCore.initialize = function( rootDOM ) {

	// Init properties
	this.hmd = false;

	// Keep a reference to the root DOM
	this.rootDOM = rootDOM;

	// Create a new viewport instance
	this.viewport = new Viewport( rootDOM, {} );

	// Listen for window resize events
	window.addEventListener( 'resize', (function() {

		// Resize viewport
		this.viewport.resize();

	}).bind(this), false );

}

/**
 * Start/Stop video animation
 */
VideoCore.setPaused = function( enabled ) {
	paused = enabled;
	this.viewport.setPaused( enabled );

	if (!enabled) {

		if (this.hmd && (navigator.getVRDisplays !== undefined || navigator.getVRDevices !== undefined)) {

			// Enter in presentation mode
			this.viewport.hmdEffect.requestPresent();

		} else {

			// Enable full-screen when switching state
			if (this.rootDOM.requestFullscreen) {
				this.rootDOM.requestFullscreen();
			} else if (this.rootDOM.webkitRequestFullscreen) {
				this.rootDOM.webkitRequestFullscreen();
			} else if (this.rootDOM.mozRequestFullScreen) {
				this.rootDOM.mozRequestFullScreen();
			} else if (this.rootDOM.msRequestFullscreen) {
				this.rootDOM.msRequestFullscreen();
			}

		}

	}
}

/**
 * Start/Stop video animation
 */
VideoCore.setHMD = function( enabled ) {
	this.hmd = enabled;
	this.viewport.setHMD( enabled );
}

/**
 * Set message handler
 */
VideoCore.setMessageHandler = function( fn ) {
	messageFn = fn;
}

/**
 * Show a message
 * (Timeout is in seconds!)
 */
VideoCore.showMessage = function( title, body, timeout ) {
	if (!messageFn) return;
	messageFn({
		'title': title,
		'body': body,
		'type': 'message'
	})

	// Schedule timeout that pauses when
	// the scene is also paused
	clearInterval(timeoutTimer);
	if (timeout) {
		timeoutVal = timeout;
		timeoutTimer = setInterval((function() {

			// Pause when paused
			if (paused) return;

			// Hide message when reached 0
			if (--timeoutVal <= 0) {
				VideoCore.hideMessage();
				clearInterval(timeoutTimer);
			}

		}).bind(this), 1000);
	}

}

/**
 * Show an error message message
 */
VideoCore.showError = function( title, body ) {
	if (!messageFn) return;
	messageFn({
		'title': title,
		'body': body,
		'type': 'error'
	})
}

/**
 * Hide a visible message
 */
VideoCore.hideMessage = function() {
	if (!messageFn) return;
	messageFn(null);
}

// Export
module.exports = VideoCore;