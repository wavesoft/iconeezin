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
 * Animation class that takes care of dispatching the correct animation
 * mixers.
 */
var Animations = function() {
  this.mixers = [];
};

Animations.prototype = {
  constructor: Animations,

  reset: function() {
    this.mixers = [];
  },

  getMixer: function( mesh ) {

    // Check for pre-cached mixer ID
    if (mesh.__mixerid__) {
      return this.mixers[mesh.__mixerid__];
    }

    // Create a new animation mixer
    var mixer = new THREE.AnimationMixer( mesh );

    // Cache the mixer index
    Object.defineProperty(
      mesh, "__mixerid__", {
        enumerable: false,
        value: this.mixers.length,
      }
    );
    this.mixers.push(mixer);

    // Return mixer
    return mixer;
  },

  update: function(delta) {
    this.mixers.forEach(function (mixer) {
      mixer.update(delta / 1000);
    });
  }

};

module.exports = Animations;
