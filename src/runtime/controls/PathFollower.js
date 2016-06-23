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

var zero = new THREE.Vector3(0,0,0);
var norm = new THREE.Vector3();
var vec = new THREE.Vector3();
var mat = new THREE.Matrix4();
var up = new THREE.Vector3(0,0,1);

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

}

/**
 * Subclass from base controls
 */
PathFollower.prototype = Object.create( BaseControl.prototype );

/**
 * Specify the path to follow
 */
PathFollower.prototype.followPath = function( path, options ) {

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
	this.firstTangent = true;

};

/**
 * Update 
 */
PathFollower.prototype.onUpdate = function( delta ) {

	// Get point
	var p_pos = this.path.getPointAt(this.j).applyMatrix4(this.matrix),
		p_dir = this.path.getTangentAt(this.j).applyMatrix4(this.matrix).normalize();

	// Update position
	this.gimbal.position.copy( p_pos );

	// Find the binormal vector
	vec.crossVectors( p_dir, up );

	// Find the up vector
	vec.crossVectors( vec, p_dir );

	// Update direction
	this.gimbal.up = p_dir;
	this.gimbal.lookAt( p_pos.add( vec ) );

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
