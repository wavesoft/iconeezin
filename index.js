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
var AudioCore = require("./src/runtime/core/audio");
var VideoCore = require("./src/runtime/core/video");
var InputCore = require("./src/runtime/core/input");
var ExperimentsCore = require("./src/runtime/core/experiments");

/**
 * Expose useful parts of the runtime API
 */
module.exports = {

	// Iconeezin API
	'API': IconeezinAPI,

	// Iconeezin Runtime
	'Runtime': {

		'Audio': AudioCore,
		'Video': VideoCore,
		'Input': InputCore,
		'Experiments': ExperimentsCore,

		// Initialize helper
		'initialize': function( viewportDOM ) {
			VideoCore.initialize( viewportDOM );
			AudioCore.initialize(),
			InputCore.initialize();
			ExperimentsCore.initialize();
		}

	},

	// Exposing libraries for re-using
	'Libraries': {
		'three': libTHREE
	}

};
