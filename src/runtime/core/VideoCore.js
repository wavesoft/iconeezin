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
var Cursor = require("../ui/Cursor");
var Browser = require("../util/Browser");

/**
 * Private properties
 */
var paused = true;
var messageFn = null;
var interactionFn = null;
var timeoutTimer = null;
var timeoutVal = 0;
var isPresenting = false;
var viewportWidth = 0;
var viewportHeight = 0;

/**
 * The VideoCore singleton contains the
 * global video management API.
 */
var VideoCore = {};

/**
 * Initialize the video core
 */
VideoCore.initialize = function( rootDOM, canvasDOM ) {

	// Keep a reference to the root DOM
	this.rootDOM = rootDOM;

	// Create a canvas DOM if missing
	if (!canvasDOM) {
		canvasDOM = document.createElement('canvas');
		rootDOM.appendChild( canvasDOM );
	}

	// Create a new viewport instance
	this.viewport = new Viewport( canvasDOM, Browser.vrHMD );
	Browser.onVRSupportChange(function( isPlugged, vrHMD ) {
		VideoCore.viewport.setHMDDevice( isPlugged ? vrHMD : undefined );
	});

	// Create a new cursor
	this.cursor = new Cursor( this.viewport );

	// Set initial viewport size
	viewportWidth = canvasDOM.offsetWidth;
	viewportHeight =  canvasDOM.offsetHeight;
	VideoCore.viewport.setSize( viewportWidth, viewportHeight, window.devicePixelRatio );

	// Bind on document events
	Browser.onVRDisplayPresentChange(function( presenting, width, height, pixelAspectRatio ) {
		alert("VR RESIZE: w="+width+", h="+height);
		if (isPresenting = presenting) {
			VideoCore.viewport.setSize( width, height, pixelAspectRatio );
		} else {
			VideoCore.viewport.setSize( viewportWidth, viewportHeight, window.devicePixelRatio );
		}
	});
	window.addEventListener( 'resize', function() {
		viewportWidth = canvasDOM.offsetWidth;
		viewportHeight =  canvasDOM.offsetHeight;
		alert("RESIZE: w="+viewportWidth+", h="+viewportHeight);

		// When presenting in VR mode the size is defined by
		// the HMD display. So any resize event just updates the
		// DOM element (the viewport) and not the canvas
		if (!isPresenting) {
			VideoCore.viewport.setSize( viewportWidth, viewportHeight, window.devicePixelRatio );
		}

	}, false );


}

/**
 * Start/Stop video animation
 */
VideoCore.hasVR = Browser.hasVR;

/**
 * Start/Stop video animation
 */
VideoCore.setPaused = function( isPaused ) {
	var fullScreen = false;
	paused = isPaused;
	this.viewport.setPaused( isPaused );

	if (!isPaused) {

		// Request HMD present or fullscreen
		if (this.hmd) {
			Browser.requestHMDPresent();
		} else {
			Browser.requestFullscreen( VideoCore.rootDOM );
		}

	} else {

		// Exit VR/Full screen
		Browser.exitHMDPresent();
		Browser.exitFullscreen();

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