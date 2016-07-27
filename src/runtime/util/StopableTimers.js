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
 * StopableTimers is a set of setTimeout and setInterval
 * timers that can be temporarily paused
 */
var StopableTimers = {};

/**
 * List of active timers
 */
var activeTimers = [],
	lastID = 0;

/**
 * Helpers
 */
var helperTimer  = null,
	helperDelay = 1000,
	helperPaused = true;

/**
 * Helper function to trigger timers
 */
var helperFn = function() {
	var now = Date.now(), swap = [];
	if (helperPaused) return;
	
	// Process timers
	for (var i=0, l=activeTimers.length; i<l; ++i) {
		var t = activeTimers[i];
		if (now >= t.expires) {
			try { t.fn(); } catch (x) {	}
			if (t.restart) {
				t.expires = now + t.delay;
				swap.push(t);
			}
		} else {
			swap.push(t);
		}
	}
	
	// Swap arrays
	activeTimers = swap;
	if (swap.length == 0) {
		clearInterval(helperTimer);
		helperDelay = 1000;
		helperTimer = null;
	}

}

/**
 * Re-schedule helper with the given resolution in milliseconds
 */
var tuneHelper = function(resolution) {

	// Calculate effective resolution (max 60 fps)
	resolution = Math.round( resolution / 3 );
	if (resolution < 16) resolution = 16;

	// Check if we should replace existing function
	if ((resolution < helperDelay) || !helperTimer) {
		if (helperTimer) clearInterval(helperTimer);

		// Schedule helper timer
		helperDelay = resolution;
		helperTimer = setInterval( helperFn, resolution );

	}
}

/**
 * Schedule a timeout
 */
StopableTimers.setTimeout = function(fn, delay) {
	var timer = {
		'id': lastID++,
		'fn': fn,
		'delay': delay,
		'expires': Date.now() + delay,
		'remains': delay,
		'restart': false
	};
	activeTimers.push(timer);
	tuneHelper( delay );
	return timer.id;
}

/**
 * Schedule an interval
 */
StopableTimers.setInterval = function(fn, delay) {
	var timer = {
		'id': lastID++,
		'fn': fn,
		'delay': delay,
		'expires': Date.now() + delay,
		'remains': delay,
		'restart': true
	};
	activeTimers.push(timer);
	tuneHelper( delay );
	return timer.id;
}

/**
 * Clear a timeout
 */
StopableTimers.clearTimeout = StopableTimers.clearInterval = function(id) {
	for (var i=0, l=activeTimers.length; i<l; ++i) {
		var t = activeTimers[i];
		if (t.id === id) {
			activeTimers.splice( i, 1 );
			return true;
		}
	}
	return false;
}

/**
 * Set paused/running state
 */
StopableTimers.setPaused = function( paused ) {
	var now = Date.now();
	if (paused && !helperPaused) {
		for (var i=0, l=activeTimers.length; i<l; ++i) {
			var t = activeTimers[i];
			t.remains = t.expires - now;
		}
		helperPaused = true;
	} else if (!paused && helperPaused) {
		for (var i=0, l=activeTimers.length; i<l; ++i) {
			var t = activeTimers[i];
			t.expires = now + t.remains;
		}
		helperPaused = false;
	}
}

/**
 * Stop and remove all timers
 */
StopableTimers.reset = function() {
	if (helperTimer) {
		clearTimeout(helperTimer);
	}

	helperTimer = null;
	helperDelay = 1000;
	helperPaused = true;
	activeTimers = [];
}


// Export StopableTimers
module.exports = StopableTimers;