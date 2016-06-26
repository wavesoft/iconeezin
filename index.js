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

// Load libraries as soon as possible
var libTHREE = require("three");

// Iconeezin API
var IconeezinAPI = require('./api');

// Load components afterwards
var AudioCore = require("./src/runtime/core/AudioCore");
var VideoCore = require("./src/runtime/core/VideoCore");
var ControlsCore = require("./src/runtime/core/ControlsCore");
var TrackingCore = require("./src/runtime/core/TrackingCore");
var ExperimentsCore = require("./src/runtime/core/ExperimentsCore");
var InteractionCore = require("./src/runtime/core/InteractionCore");

/**
 * Expose useful parts of the runtime API
 */
module.exports = {

	// Iconeezin Configuration
	'Config': {
		'up': new libTHREE.Vector3( 0,0,1 )
	},

	// Iconeezin API
	'API': IconeezinAPI,

	// Iconeezin Runtime
	'Runtime': {

		'Audio': AudioCore,
		'Video': VideoCore,
		'Controls': ControlsCore,
		'Tracking': TrackingCore,
		'Experiments': ExperimentsCore,
		'Interaction': InteractionCore,

		// Initialize helper
		'initialize': function( viewportDOM, canvasDOM ) {

			// Initialize core components
			VideoCore.initialize( viewportDOM, canvasDOM );
			AudioCore.initialize(),
			ControlsCore.initialize();
			TrackingCore.initialize();
			ExperimentsCore.initialize();
			InteractionCore.initialize();

			// Register for some critical DOM events
			var handleFullScreenChange = function() {
				var is_fullscreen = 
					document.fullscreenElement ||
					document.webkitFullscreenElement ||
					document.mozFullScreenElement ||
					document.msFullscreenElement;

				// Forward this events to important components
				ControlsCore.mouseControl.handleFullScreenChange(is_fullscreen);

			};

			// Register full screen handler
			document.addEventListener("fullscreenchange", handleFullScreenChange);
			document.addEventListener("webkitfullscreenchange", handleFullScreenChange);
			document.addEventListener("mozfullscreenchange", handleFullScreenChange);
			document.addEventListener("MSFullscreenChange", handleFullScreenChange);

		},

		// Enable/Disable HMD
		'setHMD': function( enabled ) {
			VideoCore.setHMD( enabled );
			ControlsCore.setHMD( enabled );
		},

		// Enable/Disable paused state
		'setPaused': function( enabled ) {
			VideoCore.setPaused( enabled );
			ControlsCore.setPaused( enabled );
			TrackingCore.setPaused( enabled );
			AudioCore.setGlobalMute( enabled );
		},

	},

	// Exposing libraries for re-using
	'Libraries': {
		'three': libTHREE
	}

};
