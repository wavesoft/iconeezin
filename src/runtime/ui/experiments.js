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

	// Active & previous experiment
	this.activeExperiment = null;
	this.previousExperiment = null;

	// Previous event tracking function
	this.previousTrackingFunction = null;

	// The interactive objects from the active experiments
	this.interactiveObjects = [];
}

/**
 * Focus on a particular experiment
 */
Experiments.prototype.focusExperiment = function( experiment, cb ) {

	// Don't do anything if this is already the active experiment
	if (this.activeExperiment === experiment)
		return;
	
	var do_fadein = () => {
		// Will show active
		this.activeExperiment.onWillShow(() => {
			// Fade in active
			this.fadeIn( this.activeExperiment, () =>  {
				// We are shown
				this.activeExperiment.onShown();
				if (cb) cb();
			});
		});
	};

	var do_align = () => {
		this.alignExperiment( this.activeExperiment );
		do_fadein();
	};

	var do_fadeout = () => {
		// Will hide previous
		this.previousExperiment.onWillHide(() =>  {
			// Fade out previous
			this.fadeOut( this.previousExperiment, () =>  {

				// Remove previous experiment from scene
				this.viewport.scene.add( this.previousExperiment );

				// We are hidden
				this.previousExperiment.onHidden();
				this.previousExperiment = null;
				do_align();
			});
		});
	};

	// Shift experiments
	this.previousExperiment = this.activeExperiment;
	this.activeExperiment = experiment;

	// Add experiment on scene
	this.viewport.scene.add( experiment );

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

	this.viewport.camera.position.copy( experiment.anchor.position );
	this.viewport.camera.lookAt( 
		experiment.anchor.position.clone().add( experiment.anchor.direction )
	);

}

/**
 * Fade-in experiment
 */
Experiments.prototype.fadeIn = function( experiment, cb ) {

	// Collect scene lights
	var lights = [], lightIntensity = [];
	experiment.traverse(function(obj) {
		if (obj instanceof THREE.Light) {
			lights.push(obj);
			lightIntensity.push(obj.intensity);
		}
	});

	// Run tween
	this.viewport.runTween( 1000, function(tweenProgress) {

		// Fade in lights
		for (var i=0,l=lights.length; i<l; i++) {
			lights[i].intensity = lightIntensity[i]*tweenProgress;
		}

	});

}

/**
 * Fade-out experiment
 */
Experiments.prototype.fadeOut = function( experiment, cb ) {

	// Collect scene lights
	var lights = [], lightIntensity = [];
	experiment.traverse(function(obj) {
		if (obj instanceof THREE.Light) {
			lights.push(obj);
			lightIntensity.push(obj.intensity);
		}
	});

	// Run tween
	this.viewport.runTween( 1000, function(tweenProgress) {

		// Fade out lights
		for (var i=0,l=lights.length; i<l; i++) {
			lights[i].intensity = lightIntensity[i]*(1-tweenProgress);
		}

	})

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
	this.activeExperiment.traverse((e) => {

	})


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
