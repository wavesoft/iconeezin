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

	// Array of overall controls instances
	this.controls = [
		this.pathFollower,
		this.mouseControl, 
		this.vrControl
	];

	// Default propeties
	this.paused = true;
	this.hmd = false;

	// Default location
	this.zeroPosition = new THREE.Vector3(0,0,3);
	this.zeroRotation = new THREE.Euler(Math.PI/2,0,0);

}

/**
 * Start/Stop video animation
 */
ControlsCore.setHMD = function( hmd ) {
	if (this.hmd = hmd) {
		// Enable VR Control
		if (!this.paused) this.vrControl.enable();
		this.mouseControl.disable();
	} else {
		// Enable Mouse Control
		if (!this.paused) this.mouseControl.enable();
		this.vrControl.disable();
	}
}

/**
 * Pause/Unpause video grabbing
 */
ControlsCore.setPaused = function( paused ) {
	// Disable everything
	if (this.paused = paused) {
		this.vrControl.disable();
		this.mouseControl.disable();

	// Enable appropriate component
	} else {
		if (this.hmd) {
			this.vrControl.enable();
		} else {
			this.mouseControl.enable();
		}
	}
}

/**
 * Enable the path follower
 */
ControlsCore.followPath = function( curve, options ) {

	// Setup and enable path follower
	this.pathFollower.followPath( curve, options );
	this.pathFollower.enable();

}

/**
 * Update all the camera controls
 */
ControlsCore.onUpdate = function( delta ) {

	// Update everything
	this.vrControl.triggerUpdate( delta );
	this.mouseControl.triggerUpdate( delta );
	this.pathFollower.triggerUpdate( delta );

	// Reset position
	var camera = VideoCore.viewport.camera;
	camera.position.copy(this.zeroPosition);
	camera.rotation.copy(this.zeroRotation);
	camera.updateMatrix();

	// Apply translation
	for (var i=0, l=this.controls.length; i<l; ++i) {
		if (!this.controls[i].enabled) continue;
		camera.applyMatrix( this.controls[i].rotationMatrix );
	}

	// Apply rotation
	for (var i=0, l=this.controls.length; i<l; ++i) {
		if (!this.controls[i].enabled) continue;
		camera.applyMatrix( this.controls[i].translationMatrix );
	}

}

// Export
module.exports = ControlsCore;