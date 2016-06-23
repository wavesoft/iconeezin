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

var VideoCore = require("./VideoCore");

var SightInteraction = require("../input/SightInteraction");

var PathFollower = require("../controls/PathFollower");
var MouseControl = require("../controls/MouseControl");
var VRControl = require("../controls/VRControl");

/**
 * The ControlsCore singleton contains the
 * global user input management API.
 */
var ControlsCore = {};

/**
 * Initialize the input core
 */
ControlsCore.initialize = function() {

	// Register render callback
	VideoCore.viewport.addRenderListener( this.onUpdate.bind(this) );

	// Base controls 
	this.mouseControl = new MouseControl();
	this.vrControl = new VRControl();

	// Position-only controls
	this.pathFollower = new PathFollower();

	// Default propeties
	this.paused = true;
	this.hmd = undefined;

	// Default location
	this.zeroPosition = new THREE.Vector3(0,0,3);
	this.zeroRotation = new THREE.Euler(Math.PI/2,0,0);

	// The currently active gimbal object
	this.scene = VideoCore.viewport.scene;
	this.gimbal = VideoCore.viewport.camera;
	this.activeControl = null;

	// Create sight interaction
	this.interaction = new SightInteraction( VideoCore.viewport );

	// Set defaults
	this.setHMD( false );

}

/**
 * Update interactions when something is changed on the viewport
 */
ControlsCore.updateInteractions = function() {
	this.interaction.updateFromScene();
}

/**
 * Start/Stop video animation
 */
ControlsCore.setHMD = function( hmd ) {
	if (this.hmd != hmd) {

		// Chain appropriate gimbal
		if (hmd) {

			// Disable VR Control
			if (this.hmd === false) {
				if (this.activeControl) {
					this.gimbal = this.activeControl.unchainGimbal( this.gimbal );
				}
				this.gimbal = this.mouseControl.unchainGimbal();
				this.mouseControl.disable();
			}

			// Enable VR Control
			this.gimbal = this.vrControl.chainGimbal( this.gimbal );
			this.vrControl.enable();

			// Re-chain base control
			if (this.activeControl) {
				this.gimbal = this.activeControl.chainGimbal( this.gimbal );
			}

			// Add on scene on the correct order
			this.scene.add( this.gimbal );

		} else {

			// Disable VR Control
			if (this.hmd === true) {
				if (this.activeControl) {
					this.gimbal = this.activeControl.unchainGimbal( this.gimbal );
				}
				this.gimbal = this.vrControl.unchainGimbal();
				this.vrControl.disable();
			}

			// Enable Mouse Control
			this.gimbal = this.mouseControl.chainGimbal( this.gimbal );
			this.mouseControl.enable();

			// Re-chain base control
			if (this.activeControl) {
				this.gimbal = this.activeControl.chainGimbal( this.gimbal );
			}

			// Add on scene on the correct order
			this.scene.add( this.gimbal );

		}

		// Set HMD
		this.hmd = hmd;

	}
}

/**
 * Activate a particular control
 */
ControlsCore.activateControl = function( control ) {

	// Deactivate previous control
	if (this.activeControl)
		this.deactivateLastControl();

	// Activate
	this.gimbal = control.chainGimbal( this.gimbal );
	this.activeControl = control;
	this.activeControl.enable();

	// Add on scene on the correct order
	this.scene.add( this.gimbal );

}

/**
 * Deactivate last control
 */
ControlsCore.deactivateLastControl = function() {
	if (!this.activeControl) return;

	// Restore last control gimbal
	this.gimbal = this.activeControl.unchainGimbal( this.gimbal );
	this.activeControl.disable();
	this.activeControl = undefined;

	// Add on scene on the correct order
	this.scene.add( this.gimbal );

}

/**
 * Pause/Unpause video grabbing
 */
ControlsCore.setPaused = function( paused ) {
	// Disable everything
	if (this.paused = paused) {
		
		// Disable all controls
		this.vrControl.disable();
		this.mouseControl.disable();

		// Disable active control
		if (this.activeControl)
			this.activeControl.disable();

	// Enable appropriate component
	} else {

		// Enable appropriate camera control
		if (this.hmd) {
			this.vrControl.enable();
		} else {
			this.mouseControl.enable();
		}

		// Enable active control
		if (this.activeControl)
			this.activeControl.enable();

	}
}

/**
 * Enable the path follower
 */
ControlsCore.followPath = function( curve, options ) {

	// Setup and enable path follower
	this.pathFollower.followPath( curve, options );
	this.activateControl( this.pathFollower );

}

/**
 * Update all the camera controls
 */
ControlsCore.onUpdate = function( delta ) {

	// Update everything
	this.vrControl.triggerUpdate( delta );
	this.mouseControl.triggerUpdate( delta );
	if (this.activeControl)
		this.activeControl.triggerUpdate( delta );

	// // Reset position
	// var camera = VideoCore.viewport.camera;
	// camera.position.copy(this.zeroPosition);
	// camera.rotation.copy(this.zeroRotation);
	// camera.updateMatrix();

	// // Apply translation
	// for (var i=0, l=this.controls.length; i<l; ++i) {
	// 	if (!this.controls[i].enabled) continue;
	// 	camera.applyMatrix( this.controls[i].rotationMatrix );
	// }

	// // Apply rotation
	// for (var i=0, l=this.controls.length; i<l; ++i) {
	// 	if (!this.controls[i].enabled) continue;
	// 	camera.applyMatrix( this.controls[i].translationMatrix );
	// }

}

// Export
module.exports = ControlsCore;