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
var AudioCore = require("../runtime/core/AudioCore");

/**
 * An audio file is the source fo audio
 */
var AudioFile = function( url ) {

	// Url to the audio file
	this.url = url || "";

	// The sound object
	this.sound = null;

	// The audio buffer
	this.buffer = null;
};

/**
 * Load audio URL to the buffer
 */
AudioFile.prototype.load = function( cb ) {

	// Fire immediately if we already have the buffer
	if (this.buffer) {
		if (cb) cb(this.buffer);
		return;
	}

	// Load audio buffer
	AudioCore.audioLoader.load( this.url, (function( buffer ) {
		this.buffer = buffer;
		if (cb) cb(buffer);
	}).bind(this));

}

/**
 * Create an audio instance, don't start playing 
 */
AudioFile.prototype.create = function() {

	// Create an audio object
	var sound = new THREE.Audio( AudioCore.listener );
	AudioCore.makeResetable( sound );

	// Load buffer & play
	this.load(function( buffer ) {
		sound.setBuffer( buffer );
		sound.play();
	});

	// Return sound object
	return sound;

};

/**
 * Create a positional audio object
 */
AudioFile.prototype.createPositional = function( loop ) {

	// Create a new positional audio
	var sound = new THREE.PositionalAudio( listener );
	AudioCore.makeResetable( sound );

	// Set loop
	sound.setLoop( loop === undefined ? false : true );

	// Load buffer & play
	this.load(function( buffer ) {
		sound.setBuffer( buffer );
	});

	// Return sound object
	return sound;

};

/**
 * Shorthand to create and play
 */
AudioFile.prototype.play = function( loop ) {

	// Create an audio object
	if (!this.sound) {

		// Create a new sound object
		var sound = this.sound = new THREE.Audio( AudioCore.listener );
		AudioCore.makeResetable( sound );

		// Set loop
		this.sound.setLoop( loop === undefined ? false : true );

		// Load buffer & play
		this.load(function( buffer ) {
			sound.setBuffer( buffer );
			sound.play();
		});

	} else {

		// Just play
		this.sound.setLoop( loop === undefined ? false : true );
		this.sound.play();

	}

	// Return sound object
	return this.sound;

};

/**
 * The Audio API namespace contains the
 * classes for implementing external audio objects.
 */
module.exports = {
	'AudioFile': AudioFile,
};