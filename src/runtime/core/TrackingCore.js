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
function generateAnonymousID() {
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
	this.trackingID = generateAnonymousID();
	if (window.sessionStorage) {
		if (sessionStorage.getItem('iconeezin_anon_id')) {
			var visit = (parseInt(sessionStorage.getItem('iconeezin_visit_id')) || 0) + 1;
			this.trackingID = sessionStorage.getItem('iconeezin_anon_id') + '.' + visit;
			sessionStorage.setItem('iconeezin_visit_id', visit);
		} else {
			sessionStorage.setItem('iconeezin_anon_id', this.trackingID);
			sessionStorage.setItem('iconeezin_visit_id', 1);
			this.trackingID += '.1';
		}
	}

	// Results
	this.results = [];

	// Timers
	this.timers = { };
	this.timerAccumulators = { };
	this.timerProperties = { };

	// Globals
	this.globals = { };

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

		// Update tracking ID
		console.info('Your tracking ID is ' + this.trackingID);

		// Feed pending events
		this.events.forEach((event) => {
			this.feedEvent(event);
		});
		this.events = [];
	}
}

/**
 * Set a custom tracking ID
 */
TrackingCore.setTrackingID = function( id ) {
	this.trackingID = id;
	if (window.sessionStorage) {
		var visit = (parseInt(sessionStorage.getItem('iconeezin_visit_id')) || 0) + 1;
		sessionStorage.setItem('iconeezin_anon_id', this.trackingID);
		sessionStorage.setItem('iconeezin_visit_id', visit);
		this.trackingID = id + '.' + visit;
	}
}

/**
 * Feed event to the tracker
 */
TrackingCore.feedEvent = function( event ) {
	var propertyKeys = Object.keys(event.properties);
	var sumPropertyKeys = Object.keys(event.sum_properties);
	var group = 'global';

	// Populate group
	if (event.experiment) {
		group = event.experiment;
	}
	if (event.task) {
		group += '.' + event.task;
	}

	// Compile label
	var label = propertyKeys.sort().reduce(function (currStr, key) {
		if (currStr) currStr += "&";
		return currStr + key + '=' + event.properties[key];
	}, "");

	// Fire the core event
	if (propertyKeys.length === 0) {
		// console.debug("Feed", this.trackingID, ',', group, ',', event.name);
		ga('send', 'event',
			this.trackingID,									// Category : User ID
			group,														// Action		: Category
			event.name 												// Label    : Event
		);
	} else {
		// console.debug("Feed", this.trackingID, ',', group, ',', event.name + '.' + label);
		ga('send', 'event',
			this.trackingID,									// Category : User ID
			group,														// Action		: Category
			event.name + '.' + label 					// Label    : Event
		);
	}

	// Fire summaries
	sumPropertyKeys.forEach((key) => {
		// console.debug("Feed", this.trackingID, ',', group, ',', event.name + '.' + label + '+' + key, ',', event.sum_properties[key]);
		ga('send', 'event',
			this.trackingID,											// Category : User ID
			group,																// Action		: Category
			event.name + '.' + label + '+' + key,	// Label		: event.prop:value
			event.sum_properties[key]							// Value 		: custom
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
TrackingCore.trackEvent = function( name, properties, sum_properties ) {

	// Prepare trackign event
	var meta = {
		name: name,
		properties: properties || {},
		sum_properties: sum_properties || {},
		experiment: this.activeExperimentName,
		task: this.activeTaskName
	};

	// Keep/send tracking info
	if (this.tracking) {
		this.feedEvent(meta);
	} else {
		this.events.push(meta);
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
	this.activeTaskID += 1;
	this.activeTaskMeta = meta;
	this.activeTaskName = meta.name || 'task-'+this.activeTaskID;
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
	this.trackEvent( name + '-start', properties );
}

/**
 * Trigger an end event and stop tracking counter
 */
TrackingCore.trackEnd = function( name, properties ) {
	var duration = this.stopTimer( name );
	var eventProperties = Object.assign( {},
		this.timerProperties[ name ], properties || {}
	);

	// Track end event
	this.trackEvent( name + '-end', eventProperties, { 'duration': duration } );
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
		this.trackEvent("started");

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
	this.trackEvent("completed", {}, {
		'duration': this.stopTimer("internal.experiment")
	});

	// Reset active experiment name
	this.activeExperimentName = null;
	this.activeTaskName = "";
	this.activeTaskMeta = {};
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
		this.trackEvent("started");

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
		this.trackEvent("started");

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
	this.trackEvent("completed", track, {
		'duration': this.stopTimer("internal.task")
	});

	// Collect results
	this.results.push({
		'experiment': this.activeExperimentName,
		'task': this.activeTaskName,
		'results': results
	});

}

// Export regitry
module.exports = TrackingCore;
