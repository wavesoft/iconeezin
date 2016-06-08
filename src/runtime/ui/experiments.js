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
 * Experiments constructor
 */
var Experiments = function( viewport ) {

	// Keep a reference to the viewport
	this.viewport = viewport;

	// Register ourselves for render updates
	viewport.addRenderListener( this.onRender.bind(this) );

	// List of experiments
	this.experiments = [];

	// Active experiment
	this.activeExperiment = null;

}

/**
 * Add an experiment on the viewport
 */
Experiments.prototype.add = function( experiment ) {

	// Add experiment on stack
	this.experiments.push( experiment );

}

/**
 * Remove an experiment from the viewport
 */
Experiments.prototype.remove = function( experiment ) {

	// Make sure we have it
	var i = this.experiments.indexOf(experiment);
	if (i === -1) return;

	// Remove function
	var removeFn = (function() {
		var i = this.experiments.indexOf(experiment);
		this.experiments.splice(i,1);
	}).bind(this);

	// Fade out active experiment
	if (this.activeExperiment === experiment) {
		this.fadeOut( experiment, removeFn );
	} else {
		removeFn();
	}

}

/**
 * Fade-in experiment
 */
Experiments.prototype.fadeIn = function( experiment, cb ) {

}

/**
 * Fade-out experiment
 */
Experiments.prototype.fadeOut = function( experiment, cb ) {

}

/**
 * Render cycle for the experiments
 */
Experiments.prototype.onRender = function( delta, timestamp ) {

}

// Expose the experiments API
module.exports = Experiments;
