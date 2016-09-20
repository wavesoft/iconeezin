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
 * Generate a random ID
 */
function anonymousID() {
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	for( var i=0; i < 16; i++ )
		text += possible.charAt(Math.floor(Math.random() * possible.length));

	return 'anon-'+text;
}

/**
 * Initialize tracking core
 */
TrackingCore.initialize = function() {

	// Check if we have a tracking ID from the URL
	var trackingID = anonymousID();
	if (window.location.hash.startsWith("#u-")) {
		trackingID = 'u-' + window.location.hash.substr(3);
	}
	console.info('Your tracking ID is ' + trackingID);

	// Results
	this.results = [];

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
	this.activeExperimentName = null;
	this.activeExperimentMeta = { };
	this.activeTaskMeta = { };
	this.activeTaskName = "";
	this.activeTaskID = -1;

	// Event tracking
	this.events = [];
	this.tracking = false;

}

/**
 * Set-up tracking configuration
 */
TrackingCore.setup = function( trackingConfig ) {
	if (trackingConfig.engine === 'GA') {

		// Google analytics bootstrap
		(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
		(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
		m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
		})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

		// Start tracker
		ga('create', trackingConfig.id, 'auto');
	  ga('send', 'pageview');
		this.tracking = true;

		// Feed pending events
		this.events.forEach((event) => {
			this.feedEvent(event);
		});
		this.events = [];
	}
}

/**
 * Feed event to the tracker
 */
TrackingCore.feedEvent = function( event ) {
	var i;
	var uid = 'anonymous';
	var path = '/';
	var keys = Object.keys(event.properties);

	// Remove useful properies from the keys and handle
	// them earlier, in order to populate category and action
	if (i = keys.indexOf('experiment') >= 0) {
		path = '/' + event.properties.experiment;
		keys.splice(i,1);
	}
	if (i = keys.indexOf('uid') >= 0) {
		uid = 'U-' + event.properties.uid;
		keys.splice(i,1);
	}

	// Feed each property as a separate GA event
	Object.keys(event.properties).forEach((key) => {
		ga('send', 'event',
			uid,
			event.name,
			key+':'+event.properties[key]
		);
	});
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

	if (this.tracking) {
		this.feedEvent({ name: name, properties: properties });
	} else {
		this.events.push({ name: name, properties: properties });
	}
}

/**
 * Download experiment metadata
 */
// TrackingCore.queryExperimentMeta = function( name, callback ) {

// 	//////////////////////////////////////////
// 	console.log("Querying Experiment:", name);
// 	//////////////////////////////////////////

// 	// Keep downloaded experiment metadata
// 	this.activeExperimentMeta =
// 		{
// 			'tasks': { }
// 		};

// 	// Trigger callback
// 	if (callback)
// 		callback( this.activeExperimentMeta );

// }

/**
 * Download task metadata
 */
TrackingCore.queryNamedTaskMeta = function( name, properties, callback ) {

	//////////////////////////////////////////
	console.log("Querying Named Task:", name, properties);
	//////////////////////////////////////////

	// Get tasks
	var id = -1, meta = null;
	var tasks = this.activeExperimentMeta.tasks || [];
	for (var i=0,l=tasks.length; i<l; ++i) {
		if (tasks[i].name === name) {
			id = i;
			meta = tasks[i];
			break;
		}
	}

	// Check for failed
	if (!meta) {
		if (callback) callback( -1, null, null );
		return;
	}

	// Update local properties
	this.activeTaskMeta = meta;
	this.activeTaskName = name;
	this.activeTaskID = id;

	// Callback with the data
	if (callback) callback( id, name, meta );

}

/**
 * Download next task metadata
 */
TrackingCore.queryNextTaskMeta = function( properties, callback ) {

	//////////////////////////////////////////
	console.log("Querying Next Task:", properties);
	//////////////////////////////////////////

	// Get tasks
	var tasks = this.activeExperimentMeta.tasks || [];
	var meta = tasks[ this.activeTaskID + 1 ];

	// Check for failed
	if (!meta) {
		if (callback) callback( -1, null, null );
		return;
	}

	// Update local properties
	this.activeTaskMeta = meta;
	this.activeTaskName = meta.name;
	this.activeTaskID += 1;
	console.log("next=",this.activeTaskID,", meta=",meta);

	// Callback with the data
	if (callback) callback( this.activeTaskID, meta.name, meta );

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
TrackingCore.startExperiment = function( name, meta, callback ) {

	// Complete previous experiment
	if (this.activeExperimentName) {
		this.completeExperiment();
	}

	// Query experiment metadata
	// this.queryExperimentMeta(name, (function(meta) {

		// Activate experiment
		this.activeExperimentName = name;
		this.activeExperimentMeta = meta;
		this.restartTimer("internal.experiment");

		// Prepare for first task
		this.activeTaskID = -1;
		this.activeTaskName = "";
		this.activeTaskMeta = {};

		// Set experiment tracking data
		this.setGlobal("experiment", name);
		this.trackEvent("experiment.started", { 'experiment': name });

		// Callback with experiment metadata
		if (callback) callback(meta);

	// }).bind(this));
}

/**
 * Complete an experiment
 */
TrackingCore.completeExperiment = function() {
	if (!this.activeExperimentName) return;

	// Track event
	this.trackEvent("experiment.completed", {
		'experiment': this.activeExperimentName, 'duration': this.stopTimer("internal.experiment")
	});

	// Reset active experiment name
	this.activeExperimentName = null;
}

/**
 * Start a named experiment task (called by the experiment)
 */
TrackingCore.startNamedTask = function( name, properties, callback ) {

	// Fill missing gaps
	if (typeof properties === 'function') {
		callback = properties;
		properties = {};
	}

	// Obtain task metadata
	this.queryNamedTaskMeta( name, properties, (function( id, name, meta ) {

		// Track event
		this.trackEvent("experiment.task.started", { 'task': name, 'id': id });

		// Start task timer
		this.restartTimer("internal.task");

		// Callback with task metadata
		if (callback) callback( meta, (id+1)/(this.activeExperimentMeta.tasks || []).length );

	}).bind(this));

}

/**
 * Start next experiment stack in a row
 */
TrackingCore.startNextTask = function( properties, callback ) {

	// Fill missing gaps
	if (typeof properties === 'function') {
		callback = properties;
		properties = {};
	}

	// Obtain task metadata
	this.queryNextTaskMeta( properties, (function( id, name, meta ) {

		// Track event
		this.trackEvent("experiment.task.started", { 'task': name, 'id': id });

		// Start task timer
		this.restartTimer("internal.task");

		// Callback with task metadata
		if (callback) callback( meta, (id+1)/(this.activeExperimentMeta.tasks || []).length );

	}).bind(this));

}

/**
 * End an experiment trask (called by the experiment)
 */
TrackingCore.completeTask = function( results ) {

	// Separate store from tracking variables
	var results = results || {};
	var store = {};
	var track = {};

	Object.keys(results).forEach(function (key) {
		if (key.substr(0,1) === '_') {
			store[key] = results[key];
		} else {
			track[key] = results[key];
		}
	});

	// Track event completion
	this.trackEvent("experiment.task.completed", Object.assign(
		{
			'task': this.activeTaskName,
			'duration': this.stopTimer("internal.task")
		},track
	));

	// Collect results
	this.results.push({
		'experiment': this.activeExperimentName,
		'task': this.activeTaskName,
		'results': results
	});

}

// Export regitry
module.exports = TrackingCore;
