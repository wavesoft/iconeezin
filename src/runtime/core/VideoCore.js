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

var $ = require('jquery');
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

	// Keep a reference to the root DOM
	this.rootDOM = rootDOM;

	// Create a new viewport instance
	this.viewport = new Viewport( rootDOM, {} );

	// Listen for window resize events
	$(window).resize(() => {

		// Resize viewport
		if (this.viewport) this.viewport.resize(); 

	});

}

/**
 * Start/Stop video animation
 */
VideoCore.setPaused = function( enabled ) {
	paused = enabled;
	this.viewport.setPaused( enabled );
}

/**
 * Start/Stop video animation
 */
VideoCore.setHMD = function( enabled ) {
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
		timeoutTimer = setInterval(() => {

			// Pause when paused
			if (paused) return;

			// Hide message when reached 0
			if (--timeoutVal <= 0) {
				VideoCore.hideMessage();
				clearInterval(timeoutTimer);
			}

		}, 1000);
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