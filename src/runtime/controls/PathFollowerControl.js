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
var PathFollowerControl = function( ) {
	BaseControl.call( this );

	// Path properties
	this.path = undefined;
	this.opt = {};

	// Lerping details
	this.j_speed = 0.0;
	this.j = 0;

	// Intermediate object were to apply changes
	this.target = new THREE.Object3D();

}

/**
 * Subclass from base controls
 */
PathFollowerControl.prototype = Object.create( BaseControl.prototype );

/**
 * Specify the path to follow
 */
PathFollowerControl.prototype.followPath = function( path, options ) {

	// Prepare options
	this.opt = options || {}
	this.opt.speed = this.opt.speed || 0.01;

	// Calculate speed
	var len = path.getLength();
	this.j_speed = this.opt.speed / len;

	// Keep refernces
	this.path = path;
	if (this.opt.matrix === undefined) {
		this.opt.matrix = new THREE.Matrix4();
	}

	// Start path
	this.j = 0;
	this.firstTangent = true;

};

/**
 * Replace the path on a progressing animation
 */
PathFollowerControl.prototype.replacePath = function( path ) {

	// Replace path
	this.path = path;

	// Recalculate speed
	var len = path.getLength();
	this.j_speed = this.opt.speed / len;

}

/**
 * Update 
 */
PathFollowerControl.prototype.onUpdate = function( delta ) {

	// Get point
	var p_pos = this.path.getPointAt(this.j),
		p_dir = this.path.getTangentAt(this.j).normalize();

	// Update position
	this.target.position.copy( p_pos );

	// Find the binormal vector
	vec.crossVectors( p_dir, up );

	// Find the up vector
	vec.crossVectors( vec, p_dir );

	// Update direction
	this.target.up = p_dir;
	this.target.lookAt( p_pos.add( vec ) );

	// Apply matrix
	this.target.updateMatrix();
	this.target.applyMatrix(this.opt.matrix);

	// Ease-apply updates to gimbal
	this.gimbal.up = p_dir;
	this.gimbal.position.lerp( this.target.position, 0.1 );
	this.gimbal.quaternion.slerp( this.target.quaternion, 0.1 );

	// Move forward
	this.j += this.j_speed * delta / 1000;
	if (this.j > 1.0)
		this.j = 1.0;

	// Disable either through callback, or after we completed the animation
	if (this.opt.callback) this.opt.callback(this.j);
	if ((this.j >= 1) && (this.enabled))
		this.disable();

};

// Export
module.exports = PathFollowerControl;
