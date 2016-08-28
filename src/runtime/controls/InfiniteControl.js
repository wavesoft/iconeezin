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
 * This control locks the camera in a single location and does not move it.
 *
 * Instead it passes the camera orientation to the specified 'control'
 * object in order to use it for procedural environment generation, giving
 * the illusion of motion.
 */
var InfiniteControl = function( controller ) {
	BaseControl.call( this );
  this.controller = controller;
  this.camera = null;
}

/**
 * Subclass from base controls
 */
InfiniteControl.prototype = Object.create( BaseControl.prototype );

/**
 * Chain given object in our gimbal and return the object
 */
BaseControl.prototype.chainGimbal = function( gimbal ) {
  this.gimbal.add( gimbal );

  // Locate zero gimbal
  this.camera = null;
  gimbal.traverse((function(obj) {
    if (obj instanceof THREE.Camera) {
      this.camera = obj;
    }
  }).bind(this));

  return this.gimbal;
};

/**
 * Update
 */
InfiniteControl.prototype.onUpdate = function( delta ) {
  if (this.controller && this.camera) {
    this.controller.onOrientationChange(
      this.camera.getWorldQuaternion()
    );
  }
};

// Export
module.exports = InfiniteControl;
