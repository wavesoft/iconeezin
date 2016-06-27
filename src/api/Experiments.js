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

var THREE = require("three");

/**
 * Experiment source file
 */
var ExperimentFile = function( url, className ) {

	// URL to the experiment file
	this.url = url || "";

	// Class name exported in the global scope
	// after the experiment code file is loaded
	this.className = className || "experiment";

}

/**
 * Experiment base class
 */
var Experiment = function( database ) {

	// Call superclass constructor
	THREE.Scene.call( this );

	// The database
	this.database = database;

	// Anchor point and direction
	this.anchor = {
		position: new THREE.Vector3(0,0,3),
		direction: new THREE.Vector3(0,1,0)
	}

	// Experiment features 
	this.features = {

		render: {
			glow_pass: false		/* Set to TRUE to enable glow pass */
		},
		
	};

}

/**
 * Subclass from Object3D
 */
Experiment.prototype = Object.create( THREE.Scene.prototype );
Experiment.prototype.constructor = Experiment;

/**
 * Show hook with a chance of delay the show operation
 */
Experiment.prototype.onWillShow = function( callback ) {
	callback();
};

/**
 * Show hook called when the object is shown
 */
Experiment.prototype.onShown = function() {
};

/**
 * Hide hook with a chance of delay the hide operation
 */
Experiment.prototype.onWillHide = function( callback ) {
	callback();
};

/**
 * Hide hook called when the object is shown
 */
Experiment.prototype.onHidden = function() {
};

/**
 * Update hook triggered before the render cycle
 */
Experiment.prototype.onUpdate = function( delta ) {

};

/**
 * Called when the object is paused
 */
Experiment.prototype.onPaused = function() {

};

/**
 * Called when the object is resumed
 */
Experiment.prototype.onResumed = function() {

};

/**
 * The Experiment API namespace contains the
 * classes for implementing external experiment objects.
 */
module.exports = {
	'ExperimentFile': ExperimentFile,
	'Experiment': Experiment
};
