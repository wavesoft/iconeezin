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

	// Frenet-frame calculations
	this.frenetNormal = null;
	this.frenetBinormal = null;
	this.frenetTanget = null;

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
 * Calculate next frenet frame based on tangent
 */
PathFollower.prototype.calcFrenetFrame = function( tangent ) {

	// Check for first attemt
	if (this.frenetTanget === null) {

		// select an initial normal vector perpendicular to the first tangent vector,
		// and in the direction of the smallest tangent xyz component

		this.frenetNormal = new THREE.Vector3();
		this.frenetBinormal = new THREE.Vector3();
		this.frenetTanget = tangent.clone();

		smallest = Number.MAX_VALUE;
		tx = Math.abs( tangent.x );
		ty = Math.abs( tangent.y );
		tz = Math.abs( tangent.z );

		if ( tx <= smallest ) {

			smallest = tx;
			this.frenetNormal.set( 1, 0, 0 );

		}

		if ( ty <= smallest ) {

			smallest = ty;
			this.frenetNormal.set( 0, 1, 0 );

		}

		if ( tz <= smallest ) {

			this.frenetNormal.set( 0, 0, 1 );

		}

		vec.crossVectors( tangent, this.frenetNormal ).normalize();

		this.frenetNormal.crossVectors( tangent, vec );
		this.frenetBinormal.crossVectors( tangent, normals[ 0 ] );

	} else {


		// compute the slowly-varying normal and binormal vectors for each segment on the path

		vec.crossVectors( this.frenetTanget, tangent );

		if ( vec.length() > Number.EPSILON ) {

			vec.normalize();

			theta = Math.acos( THREE.Math.clamp( this.frenetTanget.dot( tangent ), - 1, 1 ) ); // clamp for floating pt errors

			this.frenetNormal.applyMatrix4( mat.makeRotationAxis( vec, theta ) );

		}

		this.frenetBinormal.crossVectors( tangent, this.frenetNormal );

	}

}

// /**
//  * Update current normal and binormal
//  */
// PathFollower.prototype.updateNormals = function( tangent ) {
// 	var theta;

// 	// Calculate first normal and tangent
// 	if (this.firstTangent) {

// 		vec.crossVectors( tangent, this.normal ).normalize();

// 		this.normal.crossVectors( tangent, vec );
// 		this.binormal.crossVectors( tangent, this.normal );

// 		this.firstTangent = false;

// 	} else {

// 		// Copy last normal & binormal
// 		this.normal.copy( this.lastNormal );
// 		this.binormal.copy( this.lastBinormal );

// 		// Calculate tangent cross product
// 		vec.crossVectors( this.lastTangent, tangent );

// 		// I have seriously no idea what's happening here...
// 		if ( vec.length() > Number.EPSILON ) {
// 			vec.normalize();
// 			theta = Math.acos( THREE.Math.clamp( this.lastTangent.dot( tangent ), - 1, 1 ) ); // clamp for floating pt errors
// 			this.normal.applyMatrix4( mat.makeRotationAxis( vec, theta ) );
// 		}

// 		// Update binormal value
// 		this.binormal.crossVectors( tangent, this.normal );

// 	}

// 	console.log("normal=",this.normal,", binormal=",this.binormal,", tangent=",tangent);

// 	// Save last values
// 	this.lastTangent.copy( tangent );
// 	this.lastNormal.copy( this.normal );
// 	this.lastBinormal.copy( this.binormal );


// }

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
