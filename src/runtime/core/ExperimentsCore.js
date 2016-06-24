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

var VideoCore = require("./VideoCore");
var ControlsCore = require("./ControlsCore");

var Experiments = require("../ui/Experiments");
var Loaders = require("../io/Loaders");

/**
 * Kernel core is the main logic that steers the runtime 
 */
var ExperimentsCore = { };

ExperimentsCore.doit = function() {
	this.showExperiment("simple");
}

/**
 * Initialize the kernel
 */
ExperimentsCore.initialize = function() {

	// Video must ve initialized
	if (VideoCore.viewport === undefined)
		throw "Initialize video before Experiments";

	// Initialize kernel
	Loaders.initialize();

	// Create an experiments renderer that uses the viewport
	this.experiments = new Experiments( VideoCore.viewport );

	// Dictionary of active experiments
	this.loadedExperiments = {};

	// Load experiment
	setTimeout(ExperimentsCore.doit.bind(this), 100);

}

/**
 * Load an experiment and activate
 */
ExperimentsCore.showExperiment = function( experiment ) {

	// Update interactions when the experiment is visible
	var handleExperimentVisible = function() {
		ControlsCore.updateInteractions();
	}

	// Check if this is already loaded
	if (this.loadedExperiments[experiment] !== undefined) {

		// Focus to the given experiment instance on the viewport
		this.experiments.focusExperiment( this.loadedExperiments[experiment], handleExperimentVisible );

	} else {

		// Load experiment
		Loaders.loadExperiment( experiment, (function ( err, inst ) {

			// Handle errors
			if (err) {

				console.error(err);
				VideoCore.showError( "Loading Error", "Experiment '"+fname+"' could not be loaded. " + err );

			} else {

				// Keep experiment reference and focus instance
				this.loadedExperiments[experiment] = inst;
				this.experiments.focusExperiment( inst, handleExperimentVisible );

			}

		}).bind(this) );

	}

}

// Export regitry
module.exports = ExperimentsCore;
