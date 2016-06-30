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

var THREE = require("three");
require("./custom/UserAudio");

/**
 * Voice Commands API
 */
var VoiceEffects = function( listener ) {

	/**
	 * The line in from the user's microphone
	 * @property
	 */
	this.lineIn = new THREE.UserAudio( listener );

	/**
	 * Line in delay effect
	 * @property
	 */
	this.lineInDelay = null;

}

/**
 * Reset state of voice commands API
 */
VoiceEffects.prototype.reset = function() {

	// Remove effects
	if (this.lineInDelay) {
		this.lineIn.setFilters([]);
		this.lineInDelay = null;
	}

	// Stop line in
	this.lineIn.stop();

};

/**
 * Helper function to set/unset line in delay
 * @param {int} delay - The reverberation delay
 */
VoiceEffects.prototype.setDelay = function( delay ) {
	if (!delay || (delay < 0)) {

		// If we have a filter already, remove it
		if (this.lineInDelay) {
			this.lineIn.setFilters([]);
			this.lineInDelay = null;
		}

	} else {

		// Create effect if missing
		if (!this.lineInDelay) {
			this.lineInDelay = this.listener.context.createDelay();
			this.lineIn.setFilters([ this.lineInDelay ]);
		}

		// Update delay
		this.lineInDelay.delayTime.value = delay;

	}
}

/**
 * Enable or disable microphone
 * @param {bool} enabled - Set to true to enable microphone
 */
VoiceEffects.prototype.setEnabled = function( enabled ) {
	if (enabled) {
		this.lineIn.play();
	} else {
		this.lineIn.stop();
	}
}

/**
 * Receive global pause events
 */
VoiceEffects.prototype.setPaused = function( isPaused ) {

}

// Export
module.exports = VoiceEffects;
