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

var Loaders = require("../io/loaders");
var Video = require("./video");

/**
 * Kernel core is the main logic that steers the runtime 
 */
var ExperimentsCore = { };

ExperimentsCore.doit = function() {
	var fname = "simple";
	Loaders.loadExperiment( fname, function( err, experiment ) {
		if (err) {
			Video.showError( "Loading Error", "Experiment '"+fname+"' could not be loaded. " + err );
			return;
		} else {
			console.log("Loaded",experiment);
		}
	});

}

/**
 * Initialize the kernel
 */
ExperimentsCore.initialize = function() {

	// Initialize kernel
	Loaders.initialize();

}

/**
 * Load an experiment and activate
 */
ExperimentsCore.loadExperiment = function( experiment ) {

	// Load experiment
	Loaders.loadExperimentClass( experiment, function( error, inst ) {

		// Handle errors
		if (error) {
			console.error(error);
		} else {
			console.log("Loaded",inst);
		}

	});

}

// Export regitry
module.exports = ExperimentsCore;
