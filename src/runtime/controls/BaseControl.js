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

/**
 * Base class for other camera controls
 */
var BaseControl = function( ) {

	/**
	 * If set to true this will enable this control component
	 */
	this.enabled = false;

	/**
	 * Gimbal object
	 */
	this.gimbal = new THREE.Object3D();

}

/**
 * Chain given object in our gimbal and return the object
 */
BaseControl.prototype.chainGimbal = function( gimbal ) {
	this.gimbal.add( gimbal );
	return this.gimbal;
};

/**
 * Unchained the gimbal object and return it
 */
BaseControl.prototype.unchainGimbal = function( gimbal ) {
	if (gimbal !== this.gimbal)
		throw "Trying to unchain a gimbal at wrong index!";

	var child = this.gimbal.children[0];
	this.gimbal.remove( child );
	return child;
};

/**
 * Disable control
 */
BaseControl.prototype.disable = function() {
	this.enabled = false;
};

/**
 * Enable object controls
 */
BaseControl.prototype.enable = function() {
	this.enabled = true;
};

/**
 * Trigger update
 */
BaseControl.prototype.triggerUpdate = function( delta ) {
	if (!this.enabled) return;
	this.onUpdate( delta );
	this.onApplyPosition( delta );
	this.onApplyQuaternion( delta );
};


/**
 * Function called when the controls must apply their
 * transformations to the object.
 */
BaseControl.prototype.onUpdate = function( delta ) {

};

BaseControl.prototype.onApplyPosition = function( delta ) {

};

BaseControl.prototype.onApplyQuaternion = function( delta ) {

};


// Export
module.exports = BaseControl;
