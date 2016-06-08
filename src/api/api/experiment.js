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
 * The Experiment API namespace contains the
 * classes for implementing external experiment objects.
 */
var ExperimentAPI = {};

/**
 * Experiment source file
 */
ExperimentAPI.ExperimentFile = function( url, className ) {

	// URL to the experiment file
	this.url = url || "";

	// Class name exported in the global scope
	// after the experiment code file is loaded
	this.className = className || "experiment";

}

/**
 * Experiment base class
 */
ExperimentAPI.Experiment = function( database ) {
	var THREE = IconeezinRuntime.lib.three;

	// The database
	this.database = database;

	// The experiment's root object
	this.scene = new THREE.Object3D();

	// Anchor point and direction
	this.anchor = {
		point: new THREE.Vector3(0,0,0),
		direction: new THREE.Vector3(0,0,1)
	}

}

/**
 * Update hook triggered before the render cycle
 */
ExperimentAPI.Experiment.prototype.onUpdate = function( delta ) {

};

/**
 * Show hook with a chance of delay the show operation
 */
ExperimentAPI.Experiment.prototype.onWillShow = function( callback ) {
	callback();
};

/**
 * Show hook called when the object is shown
 */
ExperimentAPI.Experiment.prototype.onShown = function() {
};

/**
 * Hide hook with a chance of delay the hide operation
 */
ExperimentAPI.Experiment.prototype.onWillHide = function( callback ) {
	callback();
};

/**
 * Hide hook called when the object is shown
 */
ExperimentAPI.Experiment.prototype.onHidden = function() {
};

/**
 * Called when the experiment is paused
 */
ExperimentAPI.Experiment.prototype.onPaused = function() {
};

/**
 * Called when the experiment is resumed
 */
ExperimentAPI.Experiment.prototype.onResumed = function() {
};


// Export
module.exports = ExperimentAPI;