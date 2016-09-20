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

const VERSION = "1.0.0";

// Load libraries as soon as possible
var libTHREE = require("three");
global.THREE = libTHREE;

// Iconeezin API
var IconeezinAPI = require('./api');

// Load default configuration
var DefaultConfig = require("./src/config");
DefaultConfig.up = new libTHREE.Vector3( 0,0,1 );

// Load components afterwards
var AudioCore = require("./src/runtime/core/AudioCore");
var VideoCore = require("./src/runtime/core/VideoCore");
var ControlsCore = require("./src/runtime/core/ControlsCore");
var TrackingCore = require("./src/runtime/core/TrackingCore");
var ExperimentsCore = require("./src/runtime/core/ExperimentsCore");
var InteractionCore = require("./src/runtime/core/InteractionCore");
var BrowserUtil = require("./src/runtime/util/Browser");
var StopableTimers = require("./src/runtime/util/StopableTimers");
var ThreeUtil = require("./src/runtime/util/ThreeUtil");
var HudLayerUtil = require("./src/runtime/util/HudLayerUtil");
var SequencerUtil = require("./src/runtime/util/SequencerUtil");

/**
 * Expose useful parts of the runtime API
 */
module.exports = {

	// Iconeezin Configuration
	'Config': DefaultConfig,

	// Utility functions
	'Util': Object.assign({},
		ThreeUtil,
		HudLayerUtil,
		SequencerUtil
	),

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
		'Browser': BrowserUtil,

		// Initialize helper
		'initialize': function( viewportDOM, canvasDOM ) {
			console.log('Iconeez.in engine v' + VERSION);

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
				ControlsCore.updateFullscreenState( is_fullscreen );

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
			AudioCore.setPaused( enabled );
			ControlsCore.setPaused( enabled );
			TrackingCore.setPaused( enabled );
			ExperimentsCore.setPaused( enabled );
			StopableTimers.setPaused( enabled );
		},

		// Stoppable timers
		'setTimeout': function( fn, delay ) {
			return StopableTimers.setTimeout( fn, delay );
		},
		'setInterval': function( fn, delay ) {
			return StopableTimers.setInterval( fn, delay );
		},
		'clearTimeout': function( id ) {
			return StopableTimers.clearTimeout( id );
		},
		'clearInterval': function( id ) {
			return StopableTimers.clearInterval( id );
		},

		/**
		 * RunTween helper forward to viewport
		 */
		'runTween': function( fn, duration, cb ) {
			return VideoCore.viewport.runTween( duration, fn, cb );
		},

	},

	// Exposing libraries for re-using
	'Libraries': {
		'three': libTHREE,
	}

};
