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
var Annyang = require('annyang');

/**
 * Voice Commands API
 */
var VoiceCommands = function() {

	// Flag if annyang is active
	this.annyangActive = false;
	this.annyangPaused = false;

}

/**
 * Reset state of voice commands API
 */
VoiceCommands.prototype.reset = function() {

	// Stop if active
	if (this.annyangActive) {
		this.annyangActive = false;
		Annyang.stop();
	}

};

/**
 * Enable voice commands
 */
VoiceCommands.prototype.setCommands = function( commands ) {

	// Remove all commands
	Annyang.removeCommands();

	// Add voice commands

	// Activate annyang
	if (!this.annyangActive) {
		Annyang.start();
	}
}

/**
 * Disable voice commands
 */
VoiceCommands.prototype.setEnabled = function( isEnabled ) {
	if (this.annyangActive === isEnabled) return;

	// Keep track of enabled state
	this.annyangActive = isEnabled;

	// Enable or disable
	if (isEnabled) {
		Annyang.start();
		if (isPaused) Annyang.pause();
	} else {
		Annyang.stop();
	}
}

/**
 * Enable voice commands
 */
VoiceCommands.prototype.setPaused = function( isPaused ) {
	if (isPaused === this.annyangPaused) return;

	// Keep track of paused state
	this.annyangPaused = isPaused;

	// Update annyang state only if active
	if (this.annyangActive) {
		if (isPaused) {
			Annyang.pause();
		} else {
			Annyang.resume();
		}
	}

}

// Export
module.exports = VoiceCommands;
