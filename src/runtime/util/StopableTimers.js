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

const DEBUG_TIMERS = false;

/**
 * StopableTimers is a set of setTimeout and setInterval
 * timers that can be temporarily paused
 */
var StopableTimers = {};

/**
 * Scheduled timer events
 */
var timers = [];
var is_paused = true;
var is_scheduled = false;
var schedule_timer = null;
var last_id = 0;

/**
 * This function triggers all the expired timer events and
 * optionally re-schedules the restarting ones
 */
function cron() {
	var now = Date.now();
	if (DEBUG_TIMERS) console.debug('timer.cron now=', now);
	timers = timers.reduce(function(new_timers, timer) {
		if (DEBUG_TIMERS) console.debug('timer.cron.expires id=', timer.id, ', at=', timer.expiresAt, ', remains=', timer.expiresAt - now);
		if (now >= timer.expiresAt) {
			if (DEBUG_TIMERS) console.debug('timer.cron.trigger id=', timer.id);

			// Trigger timer callback
			try {
				timer.fn();
			} catch(e) {};

			// Restart restartable timers
			if (timer.restart) {
				if (DEBUG_TIMERS) console.debug('timer.cron.reschedule id=', timer.id, ', remains=', timer.delay);
				timer.remains = timer.delay;
				thaw(timer);
				new_timers.push(timer);
			}

		} else {

			// Keep non-expired timers
			new_timers.push(timer);

		}

		return new_timers;
	}, []);

	// Re-schedule new tick
	if (DEBUG_TIMERS) console.debug('timer.cron.timers count=', timers.length);
	if (!is_paused && timers.length) schedule();
}

/**
 * Recalibration function in order to calculate
 */
function schedule() {
	var now = Date.now();
	var min_delay = timers.reduce(function(curr_delay, timer) {
		var delay = timer.expiresAt - now;
		if (delay < curr_delay) {
			if (DEBUG_TIMERS) console.debug('timer.schedule.min id=', timer.id, ', delay=', delay);
			return delay;
		}

		return curr_delay;
	}, Infinity);

	// No event found
	if (min_delay === Infinity) return;

	// Schedule cron event
	if (DEBUG_TIMERS) console.debug('timer.schedule.cron at=', min_delay);
	is_scheduled = true;
	schedule_timer = setTimeout(cron, min_delay);
}

/**
 * Stop a possibly active schedule
 */
function unschedule() {
	if (!is_scheduled || !schedule_timer) return;
	if (DEBUG_TIMERS) console.debug('timer.unschedule');
	clearTimeout(schedule_timer);
	is_scheduled = false;
	schedule_timer = null;
}

/**
 * Thaw (enable) a timer record
 */
function thaw(timer) {
	var now = Date.now();
	var delay = timer.remains || timer.delay;

	timer.at = now;
	timer.expiresAt = now + delay;
	if (DEBUG_TIMERS) console.debug('timer.thaw id=', timer.id, ', expiresAt=', timer.expiresAt, ' (', delay, 'ms + now)');
}

/**
 * Freeze (disable) a timer record
 */
function freeze(timer) {
	var now = Date.now();
	timer.remains = timer.expiresAt - now;
	if (DEBUG_TIMERS) console.debug('timer.freeze id=', timer.id, ', remains=', timer.remains);
}

/**
 * Schedule a timeout
 */
StopableTimers.setTimeout = function(fn, delay) {
	var timer = {
		id 			: ++last_id,
		delay 	: delay,
		fn 			: fn,
		restart : false
	};
	timers.push(timer);
	if (!is_paused) thaw(timer);
	if (!is_scheduled) schedule();

	return timer.id;
}

/**
 * Schedule an interval
 */
StopableTimers.setInterval = function(fn, delay) {
	var timer = {
		id 			: ++last_id,
		delay 	: delay,
		fn 			: fn,
		restart : true
	};
	timers.push(timer);
	if (!is_paused) thaw(timer);
	if (!is_scheduled) schedule();

	return timer.id;
}

/**
 * Clear a timeout
 */
StopableTimers.clearTimeout = StopableTimers.clearInterval = function(id) {
	var i = timers.findIndex(function(timer) {
		return timer === id;
	});

	// Remove matching timer
	if (i >= 0) timers.splice(i,1);
}

/**
 * Set paused/running state
 */
StopableTimers.setPaused = function( paused ) {
	if (paused == is_paused) return;
	is_paused = paused;

	if (paused) {
		timers.forEach(freeze);
		unschedule();
	} else {
		timers.forEach(thaw);
		if (timers.length) schedule();
	}
}

/**
 * Stop and remove all timers
 */
StopableTimers.reset = function() {
	unschedule();
	timers = [];
}


// Export StopableTimers
module.exports = StopableTimers;
