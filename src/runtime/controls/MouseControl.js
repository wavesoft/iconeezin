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

var VideoCore = require('../core/VideoCore');
var BaseControl = require('./BaseControl');

const PI_2 = Math.PI / 2;
const RESET_NORMAL_SPEED = 0.01;
const RESET_FAST_SPEED = 0.25;

/**
 * Camera path locks camera into a 3D curve
 */
var MouseControl = function( ) {
	BaseControl.call( this );

	// Hook for pointer lock events
	document.addEventListener( 'pointerlockchange', this.handlePointerLockChange.bind(this), false );
	document.addEventListener( 'mozpointerlockchange', this.handlePointerLockChange.bind(this), false );
	document.addEventListener( 'webkitpointerlockchange', this.handlePointerLockChange.bind(this), false );

	// Hook for pointer lock errors
	document.addEventListener( 'pointerlockerror', this.handlePointerLockError.bind(this), false );
	document.addEventListener( 'mozpointerlockerror', this.handlePointerLockError.bind(this), false );
	document.addEventListener( 'webkitpointerlockerror', this.handlePointerLockError.bind(this), false );

	// Register a mouse handler
	document.addEventListener( 'mousemove', this.handleMouseMove.bind(this), false );

	// Prepare nexted Y/P objects
	this.pitchObject = new THREE.Object3D();
	this.yawObject = new THREE.Object3D();
	this.yawObject.add( this.pitchObject );

	// Why??
	// this.yawObject.position.y = 10;

	// Delta movement
	this.zero = new THREE.Vector2(0,0);
	this.delta = new THREE.Vector2(0,0);

	// View reset mechanism
	this.resetSpeed = 0.01;
	this.resetActive = false;
	this.resetTimeout = 2000;
	this.resetTimer = 0;
	this.resetFast = false;

}

/**
 * Subclass from base controls
 */
MouseControl.prototype = Object.create( BaseControl.prototype );

/**
 * Chain given object in our gimbal and return the object
 */
MouseControl.prototype.chainGimbal = function( gimbal ) {
	this.pitchObject.add( gimbal );
	return this.yawObject;
};

/**
 * Unchained the gimbal object and return it
 */
MouseControl.prototype.unchainGimbal = function( gimbal ) {
	if (gimbal !== this.yawObject)
		throw "Trying to unchain a gimbal at wrong index!";

	var child = this.pitchObject.children[0];
	this.pitchObject.remove( child );
	return child;
};

/**
 * 
 */
MouseControl.prototype.handlePointerLockChange = function( event ) {
	if ( document.pointerLockElement === VideoCore.rootDOM 
		|| document.mozPointerLockElement === VideoCore.rootDOM 
		|| document.webkitPointerLockElement === VideoCore.rootDOM ) {

		console.log("Grabbed!");

	} else {

		console.log("Released!");

	}
}

/**
 * 
 */
MouseControl.prototype.handlePointerLockError = function( event ) {

}

/**
 * Continue with mouse grabbing only on full screen
 */
MouseControl.prototype.handleFullScreenChange = function( isFull ) {
	if (this.enabled && isFull) {

		// Ask the browser to lock the pointer
		var elm = VideoCore.rootDOM;
		elm.requestPointerLock = 
			elm.requestPointerLock || 
			elm.mozRequestPointerLock || 
			elm.webkitRequestPointerLock;

		// Lock pointer
		elm.requestPointerLock();

	}
}

/**
 * Handle mouse move event
 */
MouseControl.prototype.handleMouseMove = function( event ) {

	// Get X/Y Movement
	var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
	var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

	// Set delta
	this.delta.x -= movementX * 0.002;
	this.delta.y -= movementY * 0.002;

	// Wrap
	this.delta.x = this.delta.x % (Math.PI*4);
	this.delta.y = this.delta.y % (Math.PI*4);

	// When the user moves the cursor, reset idle timer
	this.resetTimer = 0;
	this.resetActive = true;

}


/**
 * Set cooldown when used with path
 */
MouseControl.prototype.setResetTimeout = function( timeout, speed ) {
	this.resetTimeout = timeout;
	this.resetSpeed = speed || RESET_NORMAL_SPEED;
}

/**
 * Trigger a view reset
 */
MouseControl.prototype.resetView = function( animate ) {
	if (animate === false) {
		this.delta.set(0,0);
	} else {
		this.resetTimer = this.resetTimeout;
		this.resetFast = true;
	}
}

/**
 * Update control
 */
MouseControl.prototype.onUpdate = function( delta ) {

	// Apply rotation to yaw/pitch
	this.yawObject.rotation.z = this.delta.x;
	this.pitchObject.rotation.x = this.delta.y;
	this.pitchObject.rotation.x = Math.max( - PI_2, Math.min( PI_2, this.pitchObject.rotation.x ) );

	// Handle rotation reset
	this.resetTimer += delta;
	if (this.resetActive && (this.resetTimeout > 0)) {
		if (this.resetTimer > this.resetTimeout) {

			// Apply lerp to self, creating a ease-out effect
			var a = (this.resetTimer - this.resetTimeout) / 1000 * ( this.resetFast ? RESET_FAST_SPEED : this.resetSpeed );
			this.delta.lerp( this.zero, a );

			// Stop when reached close to zero
			if (this.delta.length() < 0.001) {
				this.resetActive = false;

				// Reset fast flag
				if (this.resetFast)
					this.resetFast = false;

			}

		}
	}

}

// Export
module.exports = MouseControl;
