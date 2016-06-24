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

var BaseControl = require('./BaseControl');

require("three/examples/js/controls/VRControls");

/**
 * Camera path locks camera into a 3D curve
 */
var VRControls = function( ) {
	BaseControl.call( this );

	// Control the gimbal with VR controls
	this.controls = new THREE.VRControls( this.gimbal );
	this.controls.userHeight = 2;

}

/**
 * Subclass from base controls
 */
VRControls.prototype = Object.create( BaseControl.prototype );

/**
 * Update control
 */
VRControls.prototype.onUpdate = function( delta ) {
	this.controls.update();	

	// Fix order
	// this.gimbal.quaternion.set(
	// 		this.gimbal.quaternion.x,
	// 		this.gimbal.quaternion.z,
	// 		this.gimbal.quaternion.y,
	// 		this.gimbal.quaternion.w
	// 	);
}

// Export
module.exports = VRControls;
