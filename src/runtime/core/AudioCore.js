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

var Tween = require("../util/Tween");
var VoiceEffects = require("../audio/VoiceEffects");
var VoiceCommands = require("../audio/VoiceCommands");

/**
 * The AudioCore singleton contains the
 * global audio management API.
 */
var AudioCore = {};

/**
 * Initialize the audio core
 */
AudioCore.initialize = function() {

	/**
	 * Three.js linstener (user speakers)
	 * @property
	 */
	this.listener = new THREE.AudioListener();

	/**
	 * Audio loader responsible for loading audio objects
	 * @property
	 */
	this.audioLoader = new THREE.AudioLoader();

	/**
	 * API to voice commands
	 * @property
	 */
	this.voiceCommands = new VoiceCommands();

	/**
	 * API to voice effects
	 * @property
	 */
	this.voiceEffects = new VoiceEffects( this.listener );

	/**
	 * Current gain volume for transitions
	 */
	this._volumeTween = null;
	this._muted = true;
	this.listener.setMasterVolume( 0 );

	/**
	 * Objects that should be reset when 'reset' clicked
	 */
	this.resetable = [];

	/**
	 * Objects paused due to global mute
	 */
	this.paused = [];

}

/**
 * Reset state
 */
AudioCore.reset = function() {

	// Reset audio effects and voice commands
	this.voiceCommands.reset();
	this.voiceEffects.reset();

	// Get & Reset resetable objects
	var resetable = this.resetable;
	this.resetable = []

	// Get resetable object max volume (for fade out)
	var volume = [];
	for (var i=0; i<resetable.length; i++) {
		volume.push( resetable[i].getVolume() );
	}

	// Tween fade out
	new Tween( 1000, 25 )
		.step((function(v) {

			// Fade out all resetable objects
			for (var i=0; i<resetable.length; i++) {
				resetable[i].setVolume( volume[i]*(1.0-v) );
			}

		}).bind(this))
		.completed((function(v) {

			// Stop all objects
			for (var i=0; i<resetable.length; i++) {
				resetable[i].stop();
			}

		}).bind(this))
		.start();

}

/**
 * Track the given sound object in order to make
 * it stop when the experiment changes.
 *
 * @param {AudioFile} sound - Set to true to enable microphone
 */
AudioCore.makeResetable = function( sound ) {
	if (this.resetable.indexOf(sound) !== -1) return;
	this.resetable.push( sound );
}

/**
 * Apply a global mute on all audio
 */
AudioCore.setGlobalMute = function( muted ) {

	// Don't do anything
	if ( muted === this._muted ) return;
	this._muted = muted;

	// Stop previous tween
	if (this._volumeTween)
		this._volumeTween.stop();

	// Create tween
	if (muted) {

		// Fade out
		this._volumeTween = new Tween(250, 25)
			.step((function(v) {
				this.listener.setMasterVolume( 1.0 - v );
			}).bind(this))
			.completed((function() {

				// Pause paying audio
				for (var i=0; i<this.resetable.length; i++) {
					if (this.resetable[i].isPlaying) {
						this.resetable[i].pause();
						this.paused.push( this.resetable[i] );
					}
				}

			}).bind(this))
			.start();

	} else {

		// Unpause paused
		for (var i=0; i<this.paused.length; i++) {
			this.paused[i].play();
		}
		this.paused = [];

		// Fade in
		this._volumeTween = new Tween(250, 25)
			.step((function(v) {
				this.listener.setMasterVolume( v );
			}).bind(this))
			.start();
	}

}

/**
 * Set the value of global reverberation
 */
AudioCore.setReverb = function( value ) {

}

/**
 * Set paused state
 */
AudioCore.setPaused = function( isPaused ) {

	// Mute on pause
	this.setGlobalMute( isPaused );

	// Forward to sub-components
	this.voiceCommands.setPaused( isPaused );
	this.voiceEffects.setPaused( isPaused );

}

// Export
module.exports = AudioCore;
