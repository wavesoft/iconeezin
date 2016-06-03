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

var $ = require("jquery");
var THREE = require("three-extras");

/**
 * Our viewport is where everything gets rendered
 */
var Viewport = function( viewportDOM, config ) {

	/////////////////////////////////////////////////////////////
	// Properties
	/////////////////////////////////////////////////////////////

	/**
	 * Listeners that will be called upon every render() event
	 * @property
	 */
	this.renderListeners = [];

	/////////////////////////////////////////////////////////////
	// Constructor
	/////////////////////////////////////////////////////////////

	// Initialize properties
	this.viewportDOM = $(viewportDOM);
	this.paused = true;
	this.useHMD = false;
	this.experiments = [];
	this.activeExperiment = null;

	// Initialize a THREE scene
	this.scene = new THREE.Scene();

	// Initialize a camera (with dummy ratio)
	this.camera = new THREE.PerspectiveCamera( 75, 1.0, 0.1, 1000 );

	// Set the initial location of the camera
	// (Virtual units assumed to be in meters)
	this.camera.position.set( 0.0, 100.0, 0.0 );
	this.camera.lookAt( new THREE.Vector3( 0, 100.0, 2.0 ) );

	// Initialize the renderer
	this.renderer = new THREE.WebGLRenderer();
	this.viewportDOM[0].appendChild( this.renderer.domElement );

	// Initialize HMD effect and controls
	this.hmdEffect = new THREE.OculusRiftEffect( this.renderer, { worldScale: 1 } );
	this.hmdControls = new THREE.VRControls( this.camera );

	// Initialize the sizes (apply actual size)
	this.resize();

	// ==== DEBUG =====
	window.vp = this;
	// ================

}

/**
 * Resize viewport to fit new size
 */
Viewport.prototype.resize = function() {

	// Get size of the viewport
	var width = this.viewportDOM.width(),
		height = this.viewportDOM.height();

	// Update camera
	this.camera.aspect = width / height;
	this.camera.updateProjectionMatrix();

	// Update effect
	this.hmdEffect.setSize( width, height );

	// Update renderer
	this.renderer.setSize( width, height );

	// Re-render if paused
	if (this.paused) this.render();

}

/**
 * Add a render listener
 * @param {function} listener - The listener function to call before rendering the scene
 */
Viewport.prototype.addRenderListener = function( listener ) {
	// Add listener on list
	this.renderListeners.push( listener );
}

/**
 * Remove a render listener
 * @param {function} listener - The listener function to remove
 */
Viewport.prototype.removeRenderListener = function( listener ) {
	// Query
	var i = this.renderListeners.indexOf(listener);
	if (i < 0) return;
	// Remove
	this.renderListeners.splice(i,1);
}

/**
 * Render content
 */
Viewport.prototype.render = function() {

	// Schedule next frame if not paused
	if (!this.paused) requestAnimationFrame( this.render.bind(this) );

	// Get elapsed time to update animations
	var t = Date.now(),
		d = t - this.lastTimestamp;
		this.lastTimestamp = t;
		
	// Perform scene updates only if not paused
	//
	// (Render events might still be triggered ex. when window
	//  resizes. This should not update the scene though...)
	//
	if (!this.paused) {

		// Call render listeners
		for (var i=0; i<this.renderListeners.length; i++) {
			this.renderListeners[i]( d, t );
		}

		// Update experiments
		for (var i=0; i<this.experiments.length; i++) {
			this.experiments[i].onUpdate( d );
		}

		// If using HMD, update camera position
		if (this.useHMD) {
			this.hmdControls.update();
		}

	}
		
	// Render scene
	if (this.useHMD) {
		// Use HMD Effect for rendering the sterep image
		this.hmdEffect.render( this.scene, this.camera );
	} else {
		// Otherwise use classic renderer
		this.renderer.render( this.scene, this.camera );
	}

}

/**
 * Enable or disable the Head-Mounted Display view
 */
Viewport.prototype.setHMD = function( enabled ) {
	// Set the HMD flag
	this.useHMD = enabled;
	// Resize
	this.resize();
}

/**
 * Start or stop animation
 */
Viewport.prototype.setPaused = function( paused ) {

	// Start scene if paused
	if (this.paused && !paused) {
		this.paused = false;
		this.lastTimestamp = Date.now();
		this.render();

	// Pause scene if animating
	} else if (!this.paused && paused) {
		this.paused = true;

	}

}

/**
 * Add an experiment to the viewport
 *
 * @param {ExperimentBase} experiment - The experiment to add
 */
Viewport.prototype.addExperiment = function( experiment ) {

	// Store experiment in registry
	this.experiments.push( experiment );

	// Add objects
	this.scene.add( experiment.scene );

	// Separate lignts from the scene
	var lights = [];
	experiment.scene.traverse(function(obj) {
		if (obj instanceof THREE.Light) {
			lights.push( obj );
		}
	});
	experiment._lights = lights;

	// Turn off the lights
	for (var i=0; i<lights.length; i++) {

		// Keep original color & Turn light off
		lights[i]._originalColor = lights[i].color.getHex();
		lights[i].color.setHex( 0x000000 );

	}

	// If we had no active experiment so far, activate it too
	this.activateExperiment( experiment );

}

/**
 * Activate the specified experiment
 *
 * @param {ExperimentBase} experiment - The experiment to activate
 * @param {int} duration - How long the tween betwee the two experiments will be (in milliseconds)
 */
Viewport.prototype.activateExperiment = function( experiment, duration ) {

	// Calculate step and interval
	var duration = duration || 1000,
		progressPerMs = 1.0 / duration;

	// Make sure this experiment is ours
	if (this.experiments.indexOf(experiment) == -1) {
		console.error("activateExperiment: The specified experiment is not registered in the viewport!");
		return;
	}

	// Make sure we are not activating an active experiment
	if (this.activeExperiment == experiment) return;

	// Inform current experiment that is activated
	experiment.onActivate();

	// Prepare for tween
	var tweenProgress = 0,
		tweenFunction = (function( delta, ts ) {

			// Wrap bounds
			if (tweenProgress > 1.0) tweenProgress = 1.0;

			// ------------------------------------------------------
			//
			// Tween-OUT Past experiment
			//
			if (this.activeExperiment) {
				// Fade out all the lights of the previous experiment
				for (var i=0; i<this.activeExperiment.lights.length; i++) {
					this.activeExperiment.lights[i].color
						.setHex( this.activeExperiment.lights[i].originalColor )
						.multiplyScalar( 1 - tweenProgress );
				}
			}

			// ------------------------------------------------------
			//
			// Tween-IN Current experiment
			//

			// Fade in the lights of the current experiment
			for (var i=0; i<experiment.lights.length; i++) {
				experiment.lights[i].color
					.setHex( experiment.lights[i].originalColor )
					.multiplyScalar( tweenProgress );
			}

			// ------------------------------------------------------

			// Handle termination
			if (tweenProgress == 1.0) {
				// Inform past experiment that is now inactive
				if (this.activeExperiment) {
					this.activeExperiment.onDeactivate();
				// Set the new active experiment
				this.activeExperiment = experiment;
				}
				// Remove from render listeners
				this.removeRenderListener( tweenFunction );
			}

			// Update progress
			tweenProgress += progressPerMs * delta;

	}).bind(this);

	// Register tween function
	this.addRenderListener( tweenFunction );

}

/**
 * Remove an experiment to the viewport
 */
Viewport.prototype.removeExperiment = function( experiment ) {

}

// Export viewport
module.exports = Viewport;
