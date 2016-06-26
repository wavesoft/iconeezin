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
var interactionFn = null;
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
VideoCore.initialize = function( rootDOM, canvasDOM ) {

	// Init properties
	this.hmd = false;
	this.vrDevice = null;
	this.vrDeprecatedAPI = false;

	// Keep a reference to the root DOM
	this.rootDOM = rootDOM;

	// Create a canvas DOM if missing
	if (!canvasDOM) {
		canvasDOM = document.createElement('canvas');
		rootDOM.appendChild( canvasDOM );
	}

	// Create a new viewport instance
	this.viewport = new Viewport( canvasDOM, {} );

	// Listen for window resize events
	window.addEventListener( 'resize', (function() {

		// Resize viewport
		this.viewport.resize();

	}).bind(this), false );

}

/**
 * Check if the browser supports VR
 */
VideoCore.hasVR = function() {
	return navigator.getVRDisplays !== undefined || navigator.getVRDevices !== undefined;
}

/**
 * Check if we have VR and get first VR Device
 */
VideoCore.grabVR = function( cb ) {

	// Check for missing VR
	if (!this.hasVR()) {
		if (cb) cb(null, "Your browser does not support WebVR");
		return;
	}

	// Got VR Devices
	var gotVRDevices = (function( devices ) {

		// Iterate over devices
		this.vrDevice = null;
		for ( var i = 0; i < devices.length; i ++ ) {

			if ( 'VRDisplay' in window && devices[ i ] instanceof VRDisplay ) {

				this.vrDevice = devices[ i ];
				this.vrDeprecatedAPI = false;
				break; // We keep the first we encounter

			} else if ( 'HMDVRDevice' in window && devices[ i ] instanceof HMDVRDevice ) {

				this.vrDevice = devices[ i ];
				this.vrDeprecatedAPI = true;
				break; // We keep the first we encounter

			}

		}

		// Check if we couldn't find a device
		if (!this.vrDevice) {
			if (cb) cb(null, "No devices found");
		} else {
			if (cb) cb( this.vrDevice );
		}

	}).bind(this);

	// VR Displays
	if ( navigator.getVRDisplays ) {
		navigator.getVRDisplays().then( gotVRDevices );
	} else if ( navigator.getVRDevices ) {
		// Deprecated API.
		navigator.getVRDevices().then( gotVRDevices );
	}

};

/**
 * Release VR Resources
 */
VideoCore.releaseVR = function() {
	if (!this.vrDevice) return;
	this.vrDevice = null;
};

/**
 * Start/Stop video animation
 */
VideoCore.setPaused = function( enabled ) {
	var fullScreen = false;
	paused = enabled;
	this.viewport.setPaused( enabled );

	if (!enabled) {

		if (this.hmd) {

			// Request presentation from the HMD effect
			VideoCore.viewport.hmdEffect.requestPresent();

		} else {

			// Enter fullscreen
			VideoCore.hideMessage();
			fullScreen = true;

		}

		//
		// Check fullscreen request
		//
		if (fullScreen) {
			if (fullScreen === true) fullScreen = undefined;

			// Enable full-screen when switching state
			if (this.rootDOM.requestFullscreen) {
				this.rootDOM.requestFullscreen( fullScreen );
			} else if (this.rootDOM.webkitRequestFullscreen) {
				this.rootDOM.webkitRequestFullscreen( fullScreen );
			} else if (this.rootDOM.mozRequestFullScreen) {
				this.rootDOM.mozRequestFullScreen( fullScreen );
			} else if (this.rootDOM.msRequestFullscreen) {
				this.rootDOM.msRequestFullscreen( fullScreen );
			}

		}

	} else {

		// Exit VR/Full screen

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
 * Set label handler
 */
VideoCore.setInteractionHandle = function( fn ) {
	interactionFn = fn;
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

/**
 * Show an interaction label
 */
VideoCore.showInteractionLabel = function( label ) {
	VideoCore.viewport.label.text = label;
}

/**
 * Hide an interaction label
 */
VideoCore.hideInteractionLabel = function() {
	VideoCore.viewport.label.text = "";
}

// Export
module.exports = VideoCore;