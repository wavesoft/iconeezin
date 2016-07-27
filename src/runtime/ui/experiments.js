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
var Experiments = function( viewport, controls ) {

	// Keep references
	this.viewport = viewport;
	this.controls = controls;

	// Register ourselves for render updates
	viewport.addRenderListener( this.onRender.bind(this) );

	// Active & previous experiment
	this.activeExperiment = null;
	this.previousExperiment = null;

	// Previous event tracking function
	this.previousTrackingFunction = null;

	// Handle scene updates
	this.onSceneUpdate = null;

	// The interactive objects from the active experiments
	this.interactiveObjects = [];
}

/**
 * Focus on a particular experiment
 */
Experiments.prototype.focusExperiment = function( experiment, cb_completed, cb_transition ) {

	// Don't do anything if this is already the active experiment
	if (this.activeExperiment === experiment)
		return;
	
	var do_fadein = (function() {
		// Will show active
		this.activeExperiment.onWillShow((function() {
			// Fade in active
			this.activeExperiment.isActive = true;
			this.fadeIn( this.activeExperiment, (function() {

				// We are shown
				this.activeExperiment.onShown();

				// Render view port to update the UI
				this.viewport.render();

				// Callback completion
				if (cb_completed) cb_completed();

			}).bind(this));
		}).bind(this));
	}).bind(this);

	var do_align = (function() {

		// Add experiment on scene
		console.log("Adding", this.activeExperiment);
		this.viewport.scene.add( this.activeExperiment );
		// Algn experiment
		this.alignExperiment( this.activeExperiment );
		
		// Trigger transition callback
		if (cb_transition) cb_transition();

		// Fade-in
		do_fadein();

	}).bind(this);

	var do_fadeout = (function() {
		// Will hide previous
		this.previousExperiment.onWillHide((function() {
			// Fade out previous
			this.previousExperiment.isActive = false;
			this.fadeOut( this.previousExperiment, (function() {

				// Remove previous experiment from scene
				console.log("Removing", this.previousExperiment);
				this.viewport.scene.remove( this.previousExperiment );

				// We are hidden
				this.previousExperiment.onHidden();
				this.previousExperiment = null;
				do_align();
				
			}).bind(this));
		}).bind(this));
	}).bind(this);

	// Shift experiments
	this.previousExperiment = this.activeExperiment;
	this.activeExperiment = experiment;

	// Fade out if we have a previous
	if (this.previousExperiment) {
		do_fadeout();
	} else {
		do_align();
	}

}

/**
 * Align given experiment with the current camera orientation
 */
Experiments.prototype.alignExperiment = function( experiment ) {

	// Set zero
	this.controls.setZero( 
		experiment.anchor.position, 
		experiment.anchor.direction
	);

}

/**
 * Fade-in experiment
 */
Experiments.prototype.fadeIn = function( experiment, cb ) {

	// Run tween
	this.viewport.runTween( 1000, (function(tweenProgress) {

		// Fade out
		this.viewport.setOpacity( tweenProgress );

	}).bind(this), cb);

}

/**
 * Fade-out experiment
 */
Experiments.prototype.fadeOut = function( experiment, cb ) {

	// Run tween
	this.viewport.runTween( 1000, (function(tweenProgress) {

		// Fade out
		this.viewport.setOpacity( 1.0 - tweenProgress );

	}).bind(this), cb)

}

/**
 * Update internal state
 *
 * This function obtaines detailed information from the registered experiments
 * and populates the detailed internal state objects. This takes a lot of time
 * and should not be used in the render loop. Call this function only when
 * a change occurs in the scene.
 */
Experiments.prototype.updateState = function() {

	// Reset state
	this.interactiveObjects = [];

	// Don't do anything if no active experiment
	if (!this.activeExperiment) return;

	// Extract interactive objects
	this.activeExperiment.traverse((function(e) {

	}).bind(this));

}

/**
 * Render cycle for the experiments
 */
Experiments.prototype.onRender = function( delta, timestamp ) {

	// Render previous experiment
	if (this.previousExperiment) {
		this.previousExperiment.onUpdate( delta, timestamp );
	}

	// Render active experiment
	if (this.activeExperiment) {
		this.activeExperiment.onUpdate( delta, timestamp );
	}

}

// Expose the experiments API
module.exports = Experiments;
