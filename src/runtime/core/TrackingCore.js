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
 * Tracking core exposes feedback information for the analysts
 */
var TrackingCore = { };

/**
 * Initialize tracking core
 */
TrackingCore.initialize = function( trackingID ) {

	// Timers
	this.timers = { };
	this.timerAccumulators = { };
	this.timerProperties = { };

	// Globals
	this.globals = { };
	if (trackingID) {
		this.globals['uid'] = trackingID;
	}

	// Active experiment metadata
	this.activeExperimentMeta = { };
	this.activeTaskMeta = { };
	this.activeTaskName = "";

}

/**
 * Pause/Resume tracking timer
 */
TrackingCore.setPaused = function( enabled ) {
	if (enabled) {

		// Snapshot all timers and place on accumulators
		for (name in this.timers) {
			// Collect duration till NOW on accummulators
			this.timerAccumulators[name] += (Date.now() - this.timers[name]);
		}

	} else {

		// Restart all timers
		for (name in this.timers) {
			// Start counting from NOW
			this.timers[name] = Date.now();
		}

	}
}

/**
 * Set global event property
 */
TrackingCore.setGlobal = function( property, value ) {
	this.globals[property] = value;
}

/* ############################################################ */
/*  Low-Level Functions                                         */
/* ############################################################ */

/**
 * Set global event property
 */
TrackingCore.trackEvent = function( name, properties ) {
	var eventProperties = Object.assign( {}, this.globals, properties || {} );

	//////////////////////////////////////////
	console.log("Event:", name, eventProperties);
	//////////////////////////////////////////

}

/**
 * Download experiment metadata
 */
TrackingCore.queryExperimentMeta = function( name, callback ) {

	//////////////////////////////////////////
	console.log("Querying Experiment:", name);
	//////////////////////////////////////////

	// Keep downloaded experiment metadata
	this.activeExperimentMeta = 
		{
			'tasks': { }
		};

	// Trigger callback
	if (callback)
		callback( this.activeExperimentMeta );

}

/**
 * Download task metadata
 */
TrackingCore.queryTaskMeta = function( name, properties, callback ) {

	//////////////////////////////////////////
	console.log("Querying Task:", name, properties);
	//////////////////////////////////////////

	// Get task metadata
	this.activeTaskMeta = (this.activeExperimentMeta.tasks || {})[name] || {};

	// Callback with the data
	if (callback)
		callback( this.activeTaskMeta );

}

/* ############################################################ */
/*  High-Level Tracking                                         */
/* ############################################################ */

/**
 * Trigger a start event and start tracking counter
 */
TrackingCore.trackStart = function( name, properties ) {
	this.restartTimer( name );
	this.timerProperties[ name ] = properties;
	this.trackEvent( name + '.start', properties );
}

/**
 * Trigger an end event and stop tracking counter
 */
TrackingCore.trackEnd = function( name, properties ) {
	var duration = this.stopTimer( name );
	var eventProperties = Object.assign( {},
		this.timerProperties[ name ], properties || {},
		{ 'duration': duration });

	// Track end event
	this.trackEvent( name + '.end', eventProperties );
	delete this.timerProperties[ name ];

}

/* ############################################################ */
/*  Timer API  Functions                                        */
/* ############################################################ */

/**
 * Start a timer with the given name
 */
TrackingCore.startTimer = function(name) {
	// If timer is already started, don't start
	if (this.timers[name] !== undefined) return;
	// Store the current time in the given timer
	this.timers[name] = Date.now();
	this.timerAccumulators[name] = 0;
}

/**
 * Restart a timer with the given name
 */
TrackingCore.restartTimer = function(name) {
	// If we already have a timer, get current duration
	var duration = this.stopTimer(name);
	// Replace timer start time
	this.timers[name] = Date.now();
	this.timerAccumulators[name] = 0;
	// Return duration
	return duration;
}

/**
 * Return the time on the specified timer
 */
TrackingCore.getTimer = function(name) {
	// Check for invalid timers
	if (!this.timers[name]) return 0;
	// Return duration
	return  (Date.now() - this.timers[name]) + this.timerAccumulators[name];
}

/**
 * Stop a timer with the given name and return
 * the time spent.
 */
TrackingCore.stopTimer = function(name) {
	// Check for invalid timers
	if (!this.timers[name]) return 0;
	// Stop timer and get duration
	var duration = (Date.now() - this.timers[name]) + this.timerAccumulators[name];
	delete this.timers[name];
	delete this.timerAccumulators[name];
	// Return duration
	return duration;
}

/**
 * Start an experiment (called by core)
 */
TrackingCore.startExperiment = function( name, callback ) {
	this.queryExperimentMeta(name, (function(meta) {

		// Set experiment tracking data
		this.setGlobal("experiment", name);
		this.trackEvent("experiment.started");

		// Callback with experiment metadata
		if (callback) callback(meta);

	}).bind(this));
}

/**
 * Start an experiment trask (called by the experiment)
 */
TrackingCore.startTask = function( name, properties, callback ) {

	// Fill missing gaps
	if (typeof properties === 'function') {
		callback = properties;
		properties = {};
	}

	// Obtain task metadata
	this.queryTaskMeta( name, properties, (function(meta) {

		// Keep properties
		this.activeTaskName = name;

		// Track event
		this.trackEvent("experiment.task.started", { 'task': name });

		// Start task timer
		this.restartTimer("task");

		// Callback with task metadata
		if (callback) callback( meta );

	}).bind(this));

}

/**
 * End an experiment trask (called by the experiment)
 */
TrackingCore.completeTask = function( results ) {

	// Track event completion
	this.trackEvent("experiment.task.completed", Object.assign({ 
		'task': this.activeTaskName, 'duration': this.stopTimer("task") }, results
	));

	// Reset active task
	this.activeTaskMeta = {};
	this.activeTaskName = "";

}

// Export regitry
module.exports = TrackingCore;
