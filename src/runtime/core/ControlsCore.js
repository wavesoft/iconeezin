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

var PathFollowerControl = require("../controls/PathFollowerControl");
var MouseControl = require("../controls/MouseControl");
var VRControl = require("../controls/VRControl");

/**
 * The ControlsCore singleton contains the
 * global user input management API.
 */
var ControlsCore = {};

/**
 * Private properties
 */
var mouseControl, vrControl, activeControl,
	pathFollower, scene, gimbal, zeroGimbal, interaction;

/**
 * Initialize the input core
 */
ControlsCore.initialize = function() {

	// Register render callback
	VideoCore.viewport.addRenderListener( this.onUpdate.bind(this) );

	// Base controls 
	mouseControl = new MouseControl();
	vrControl = new VRControl();

	// Position-only controls
	pathFollower = new PathFollowerControl();

	// Default propeties
	this.paused = true;
	this.hmd = undefined;

	// The currently active gimbal object
	gimbal = VideoCore.viewport.camera;
	activeControl = null;

	// The zero gimbal that holds the reference position
	zeroGimbal = new THREE.Object3D();
	zeroGimbal.up.set( 0,0,1 );
	VideoCore.viewport.scene.add( zeroGimbal );

	// Create sight interaction
	interaction = new SightInteraction( VideoCore.cursor, VideoCore.viewport );

	// Set defaults
	this.setHMD( false );
	this.setZero( 
		new THREE.Vector3(0,0,3), 
		new THREE.Vector3(0,1,0)
	);

}

/**
 * Initialize the input core
 */
ControlsCore.updateFullscreenState = function( isFullscreen ) {

	// Handle full screen change
	mouseControl.handleFullScreenChange( isFullscreen );

}

/**
 * Reset controls
 */
ControlsCore.reset = function() {

	// Remove last controll
	this.deactivateLastControl();

	// Reset mouse view
	this.reorientMouseView( false );

	// Reset interactions
	interaction.reset();

}

/**
 * Update interactions when something is changed on the viewport
 */
ControlsCore.updateInteractions = function() {
	interaction.updateFromScene();
}

/**
 * Set zero position
 */
ControlsCore.setZero = function( position, direction ) {

	// Set gimbal position
	zeroGimbal.position.copy( position );

	// Project direction to XY plane
	zeroGimbal.rotation.z = Math.atan2( direction.x, direction.y );
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
				if (activeControl) {
					gimbal = activeControl.unchainGimbal( gimbal );
				}
				gimbal = mouseControl.unchainGimbal( gimbal );
				mouseControl.disable();
			}

			// Enable VR Control
			gimbal = vrControl.chainGimbal( gimbal );
			vrControl.enable();

			// Re-chain base control
			if (activeControl) {
				gimbal = activeControl.chainGimbal( gimbal );
			}

			// Add on scene on the correct order
			zeroGimbal.add( gimbal );

		} else {

			// Disable VR Control
			if (this.hmd === true) {
				if (activeControl) {
					gimbal = activeControl.unchainGimbal( gimbal );
				}
				gimbal = vrControl.unchainGimbal( gimbal );
				vrControl.disable();
			}

			// Enable Mouse Control
			gimbal = mouseControl.chainGimbal( gimbal );
			mouseControl.enable();

			// Re-chain base control
			if (activeControl) {
				gimbal = activeControl.chainGimbal( gimbal );
			}

			// Add on scene on the correct order
			zeroGimbal.add( gimbal );

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
	if (activeControl)
		this.deactivateLastControl();

	// Activate
	gimbal = control.chainGimbal( gimbal );
	activeControl = control;
	activeControl.enable();

	// Add on scene on the correct order
	zeroGimbal.add( gimbal );

}

/**
 * Deactivate last control
 */
ControlsCore.deactivateLastControl = function() {
	if (!activeControl) return;

	// Restore last control gimbal
	gimbal = activeControl.unchainGimbal( gimbal );
	activeControl.disable();
	activeControl = undefined;

	// Add on scene on the correct order
	zeroGimbal.add( gimbal );

}

/**
 * Pause/Unpause video grabbing
 */
ControlsCore.setPaused = function( paused ) {
	// Disable everything
	if (this.paused = paused) {
		
		// Disable all controls
		vrControl.disable();
		mouseControl.disable();

		// Disable active control
		if (activeControl)
			activeControl.disable();

	// Enable appropriate component
	} else {

		// Enable appropriate camera control
		if (this.hmd) {
			vrControl.enable();
		} else {
			mouseControl.enable();
		}

		// Enable active control
		if (activeControl)
			activeControl.enable();

	}
}

/**
 * Enable the path follower
 */
ControlsCore.followPath = function( curve, options ) {

	// Setup and enable path follower
	pathFollower.followPath( curve, options );
	this.activateControl( pathFollower );

}

/**
 * Replace an existing path follower
 */
ControlsCore.replaceFollowPath = function( curve ) {

	// Setup and enable path follower
	if (activeControl === pathFollower) {
		pathFollower.replacePath( curve );
	} else {
		console.error("Replacing path on a path follower, but path follower is not active!");
	}

}

/**
 * Re-orient mouse view
 */
ControlsCore.reorientMouseView = function( animate ) {
	mouseControl.resetView( animate );
}

/**
 * Update all the camera controls
 */
ControlsCore.onUpdate = function( delta ) {

	// Update everything
	vrControl.triggerUpdate( delta );
	mouseControl.triggerUpdate( delta );
	if (activeControl)
		activeControl.triggerUpdate( delta );

}

// Export
module.exports = ControlsCore;