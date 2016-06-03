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
var Viewport = require("../ui/viewport");

/**
 * The VideoCore singleton contains the
 * global video management API.
 */
var VideoCore = {};

/**
 * Initialize the video core
 */
VideoCore.initialize = function( rootDOM ) {

	// Create a new viewport instance
	this.viewport = new Viewport( rootDOM, {} );

	// Function to call for displaying a message
	this.__messagenfn = null;

	// Listen for window resize events
	$(window).resize((function() {

		// Resize viewport
		if (this.viewport) this.viewport.resize(); 

	}).bind(this));

}

/**
 * Start/Stop video animation
 */
VideoCore.setPaused = function( enabled ) {
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
	this.__messagenfn = fn;
}

/**
 * Show a message
 */
VideoCore.showMessage = function( title, body, timeout ) {
	if (!this.__messagenfn) return;
	this.__messagenfn({
		'title': title,
		'body': body,
		'type': 'message'
	})
}

/**
 * Show an error message message
 */
VideoCore.showError = function( title, body ) {
	if (!this.__messagenfn) return;
	this.__messagenfn({
		'title': title,
		'body': body,
		'type': 'error'
	})
}

/**
 * Hide a visible message
 */
VideoCore.hideMessage = function() {
	if (!this.__messagenfn) return;
	this.__messagenfn(null);
}


// Export
module.exports = VideoCore;