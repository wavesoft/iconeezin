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
 * Interaction core exposes all the user-computer interaction API
 */
var InteractionCore = { };

/**
 * Initialize interaction core
 */
InteractionCore.initialize = function() {
	
}

/**
 * Say something to the user
 */
InteractionCore.say = function( phrase ) {
	var msg = new SpeechSynthesisUtterance( phrase );
	msg.lang = 'en-US';
    window.speechSynthesis.speak(msg);
}

/**
 * Helper function to expose only onInteract
 */
InteractionCore.makeInteractive = function( object, options ) {

	// Prepare interaction options
	var opt = {};
	if (typeof(options) == 'object') {

		// Object-defined
		opt.onMouseOver = options.onMouseOver;
		opt.onMouseOut = options.onMouseOut;
		opt.onMouseDown = options.onMouseDown;
		opt.onMouseUp = options.onMouseUp;
		opt.onClick = options.onClick;
		opt.onInteract = options.onInteract;
		opt.gaze = (options.gaze === undefined) ? true : options.gaze;
		opt.color = options.color || new THREE.Color( 0x0066ff );
		opt.title = options.title;
		opt.trackID = options.trackID;

	} else {

		// Simple callback
		opt.onInteract = options;
		opt.gaze = true;

	}

	// Define interact options
	Object.defineProperty(
		object, "__interact__", {
			enumerable: false,
			value: opt,
		}
	);
}


// Export regitry
module.exports = InteractionCore;
