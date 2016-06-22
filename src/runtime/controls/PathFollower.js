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

var THREE = require('three');
var BaseControl = require('./BaseControl');

/**
 * Camera path locks camera into a 3D curve
 */
var PathFollower = function( ) {
	BaseControl.call( this );

	// Path properties
	this.path = undefined;
	this.callback = undefined;
	this.speed = 0.0;
	this.matrix = new THREE.Matrix4();
	this.j = 0;

	// The up plane
	this.plane = new THREE.Plane(
			new THREE.Vector3(0,0,1),
			new THREE.Vector3(-1,0,0)
		);

}

/**
 * Subclass from base controls
 */
PathFollower.prototype = Object.create( BaseControl.prototype );

/**
 * Specify the path to follow
 */
BaseControl.prototype.followPath = function( path, options ) {

	// Prepare options
	var opt = options || {},
		speed = opt.speed || 0.01;

	// Calculate speed
	var len = path.getLength();
	this.speed = speed / len;

	// Keep refernces
	this.path = path;
	this.callback = opt.callback;
	if (opt.matrix) {
		this.matrix.copy( opt.matrix );
	} else {
		this.matrix.identity();
	}

	// Start path
	this.j = 0;

};

/**
 * Update 
 */
BaseControl.prototype.onUpdate = function( delta ) {

	// Get point
	var pt = this.path.getPointAt(this.j).applyMatrix4(this.matrix),
		pa = this.path.getTangentAt(this.j).applyMatrix4(this.matrix).normalize();

	// Create translation vector
	console.log(pt);
	this.translationMatrix.makeTranslation(pt.x, pt.y, pt.z);

	// // Create a rotation matrix
	// this.rotationMatrix.identity();
	// this.rotationMatrix.lookAt( pt, npt, up );

	// Move forward
	this.j += this.speed * delta / 1000;
	if (this.j > 1.0)
		this.j = 1.0;

	// Disable either through callback, or after we completed the animation
	if (this.callback) this.callback(this.j);
	if ((this.j >= 1) && (this.enabled))
		this.disable();

};

// Export
module.exports = PathFollower;
