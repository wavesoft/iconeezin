"use strict";
/**
 * Iconeez.in - A Web VR Platform for social AnimatedObject3Ds
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

var THREE = require("three");

////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////

/**
 * An animated Object3D is just an Object3D with the onUpdate function
 */
var AnimatedObject3D = function( url ) {
	THREE.Object3D.call(this);
};

/**
 * Subclasses from Object3D
 */
AnimatedObject3D.prototype = Object.create( THREE.Object3D.prototype );

/**
 * Update hook triggered before the render cycle
 */
AnimatedObject3D.prototype.onUpdate = function( delta ) {

};

/**
 * Called when the object is paused
 */
AnimatedObject3D.prototype.onPaused = function() {

};

/**
 * Called when the object is resumed
 */
AnimatedObject3D.prototype.onResumed = function() {

};

////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////

/**
 * An object that the user can interact with
 */
var InteractiveObject3D = function( url ) {
	THREE.Object3D.call(this);
};

/**
 * Subclasses from Object3D
 */
InteractiveObject3D.prototype = Object.create( THREE.Object3D.prototype );

/**
 * An interaction occured with the interactive object
 */
InteractiveObject3D.prototype.onInteract = function( action ) {

};

////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////

/**
 * The THREE.js API Namespace contains all the
 * customisations to the Three.js API
 */
module.exports = {
	'AnimatedObject3D': AnimatedObject3D,
	'InteractiveObject3D': InteractiveObject3D,
};
