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

var ResultsRoom = require("../ui/ResultsRoom");
var Experiments = require("../ui/Experiments");

var Config = require("../../config");
var Loaders = require("../io/Loaders");

var StopableTimers = require("../util/StopableTimers");
var SequencerUtil = require("../util/SequencerUtil");

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
	this.activeExperimentId = 0;

	// Paused state properties
	this.paused = true;
	this.pendingExperimentName = "";

	// Results room instance
	this.resultsRoom = new ResultsRoom({ });

	// Metadata
	this.meta = {};

	// Register listener for hash change events
	window.addEventListener('hashchange', (function() {
		var hash = String(window.location.hash).substr(1);
		if (!hash) return;

		// Show experiment pointed by hash
		this.showExperiment(hash);

	}).bind(this));

	// Load metadata
	this.loadMetadata((function(error) {

		// Display error
		if (error) {
			console.error("Error loading experiment metadata:", error);
			return;
		}

		// Initialize tracking
		TrackingCore.setup(this.meta.tracking || {});

		// Load default experiment if hash missing
		var hash = String(window.location.hash).substr(1);
		if (!hash) {
			this.showExperiment( this.meta.experiments[ this.activeExperimentId ].name );
		} else {
			this.showExperiment(hash);
		}

	}).bind(this));

}

/**
 * Set paused state
 */
ExperimentsCore.loadMetadata = function( callback ) {

	// Request binary bundle
	var req = new XMLHttpRequest();

	// Wait until the bundle is loaded
	req.addEventListener('readystatechange', (function () {
		if (req.readyState !== 4) return;
		if (req.status === 200) {
			try {
				this.meta = JSON.parse(req.responseText);
				callback( null );
			} catch (e) {
				callback( e.toString() );
			}
		} else {
			callback( req.statusText );
		}
	}).bind(this));

	// Place request
	req.open('GET', Config.path.metadata);
	req.send();

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
 * Pass metadata to the results screen and render
 */
ExperimentsCore.showResults = function( meta ) {

	// Reset all stopable timers
	StopableTimers.reset();

	// Focus to results room
	this.experiments.focusExperiment( this.resultsRoom,
		function() {
			// Update interactions
			ControlsCore.updateInteractions();
		},
		function() {
			// Reset controls core only when it's not visible
			AudioCore.reset();
			ControlsCore.reset();
			VideoCore.reset();
		}
	);

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

	// Find the ID that corresponds to this experiment
	this.activeExperimentId = -1;
	var meta;
	for (var i=0; i<this.meta.experiments.length; i++) {
		var e = this.meta.experiments[i];
		if (e.name == experiment) {
			this.activeExperimentId = i;
			meta = e;
			break;
		}
	}

	// Check for mismatch
	if (this.activeExperimentId == -1) {
		console.error("Iconeezin: Experiment '"+experiment+"' was not found in the metadata table.");
		return;
	}

	// Update location hash
	window.location.hash = experiment;

	// Update interactions when the experiment is visible
	var handleExperimentVisible = function() {
		ControlsCore.updateInteractions();
	}

	// Check if this is already loaded
	if (this.loadedExperiments[experiment] !== undefined) {

		// Reset other cores
		AudioCore.reset();
		StopableTimers.reset();
		SequencerUtil.reset();

		// Ask TrackingCore to prepare for the experiment
		TrackingCore.startExperiment( experiment, meta, (function() {

			// Focus to the given experiment instance on the viewport
			this.experiments.focusExperiment(
				this.loadedExperiments[experiment],
				handleExperimentVisible,
				function() {

					// Reset controls core only when it's not visible
					ControlsCore.reset();
					VideoCore.reset();

				}
			);

		}).bind(this));

	} else {

		// Reset all stopable timers
		StopableTimers.reset();
		SequencerUtil.reset();

		// Load experiment
		Loaders.loadExperiment( experiment, (function ( err, inst ) {

			// Reset other cores
			AudioCore.reset();

			// Handle errors
			if (err) {

				console.error(err);
				VideoCore.showError( "Loading Error", "Experiment '"+experiment+"' could not be loaded. " + err );

			} else {

				// Keep experiment reference and focus instance
				this.loadedExperiments[experiment] = inst;

				// Ask TrackingCore to prepare for the experiment
				TrackingCore.startExperiment( experiment, meta, (function() {
					this.experiments.focusExperiment( inst, handleExperimentVisible, function() {

						// Reset controls core only when it's not visible
						ControlsCore.reset();
						VideoCore.reset();

					});
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

/**
 * Mark current experiment as completed
 *
 * This should automatically forward to next experiment and/or show
 * the appropriate completion screen.
 *
 */
ExperimentsCore.experimentCompleted = function() {
	var next = this.meta.experiments[this.activeExperimentId+1];
	if (!next) {
		alert('done!');

	} else {

		// Complete tracking this experiment
		TrackingCore.completeExperiment();

		// Forward to next
		this.showExperiment( next.name );

	}
}

// Export regitry
module.exports = ExperimentsCore;
