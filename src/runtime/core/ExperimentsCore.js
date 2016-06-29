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
var AudioCore = require("./AudioCore");
var ControlsCore = require("./ControlsCore");
var TrackingCore = require("./TrackingCore");

var Experiments = require("../ui/Experiments");
var Loaders = require("../io/Loaders");

/**
 * Kernel core is the main logic that steers the runtime 
 */
var ExperimentsCore = { };

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
	this.experiments = new Experiments( VideoCore.viewport, ControlsCore );

	// Dictionary of active experiments
	this.loadedExperiments = {};
	this.activeExperimentName = "";

	// Paused state properties
	this.paused = true;
	this.pendingExperimentName = "";

	// Register listener for hash change events
	window.addEventListener('hashchange', (function() {
		var hash = String(window.location.hash).substr(1);
		if (!hash) return;

		// Show experiment pointed by hash
		this.showExperiment(hash);

	}).bind(this));

	// Load default experiment if hash missing
	var hash = String(window.location.hash).substr(1);
	if (!hash) {
		this.showExperiment("introduction");
	} else {
		this.showExperiment(hash);
	}

}

/**
 * Set paused state
 */
ExperimentsCore.setPaused = function( paused ) {

	// Keep paused state
	this.paused = paused;

	// If we are un-pausing, show experiment
	if (!paused && this.pendingExperimentName) {
		this.showExperiment( this.pendingExperimentName );
		this.pendingExperimentName = "";
	}

}

/**
 * Load an experiment and activate
 */
ExperimentsCore.showExperiment = function( experiment ) {

	// Don't do anything if the experiment has the same name
	// as the active one
	if (this.activeExperimentName == experiment) return;

	// If we are paused, just schedule it
	if (this.paused) {
		this.pendingExperimentName = experiment;
		return;
	}

	// Mark experiment as active
	this.activeExperimentName = experiment;

	// Update location hash
	window.location.hash = experiment;

	// Update interactions when the experiment is visible
	var handleExperimentVisible = function() {
		ControlsCore.updateInteractions();
	}

	// Check if this is already loaded
	if (this.loadedExperiments[experiment] !== undefined) {

		// Ask TrackingCore to prepare for the experiment
		TrackingCore.startExperiment( experiment, (function() {

			// Reset other cores
			AudioCore.reset();
			ControlsCore.reset();

			// Focus to the given experiment instance on the viewport
			this.experiments.focusExperiment( this.loadedExperiments[experiment], handleExperimentVisible );

		}).bind(this));

	} else {

		// Load experiment
		Loaders.loadExperiment( experiment, (function ( err, inst ) {

			// Handle errors
			if (err) {

				console.error(err);
				VideoCore.showError( "Loading Error", "Experiment '"+experiment+"' could not be loaded. " + err );

			} else {

				// Reset other cores
				AudioCore.reset();
				ControlsCore.reset();

				// Keep experiment reference and focus instance
				this.loadedExperiments[experiment] = inst;

				// Ask TrackingCore to prepare for the experiment
				TrackingCore.startExperiment( experiment, (function() {
					this.experiments.focusExperiment( inst, handleExperimentVisible );
				}).bind(this));

			}

		}).bind(this), function( progress ) {
			if (progress === 0) {
				VideoCore.cursor.showLoading();
			} else if (progress === 1) {
				VideoCore.cursor.hideLoading();
			} else {
				VideoCore.cursor.setLoadingProgress( progress );
			}
		});

	}

}

// Export regitry
module.exports = ExperimentsCore;
