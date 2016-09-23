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
AudioFile.prototype.create = function(create_cb) {

	// Create an audio object
	var sound = new THREE.Audio( AudioCore.listener );
	AudioCore.makeResetable( sound );

	// Load buffer & play
	var scope = this;
	this.load(function( buffer ) {
		sound.setBuffer( buffer );
		if (create_cb) create_cb.call(sound);
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
 * Shorthand to stop a playback audio
 */
AudioFile.prototype.stop = function() {
	if (!this.sound) {
		return;
	}
	if (!this.sound.isPlaying) {
		return;
	}
	this.sound.stop();
};

/**
 * Shorthand to create and play
 */
AudioFile.prototype.play = function( loop, complete_cb ) {
	if (typeof loop === 'function') {
		complete_cb = loop;
		loop = false;
	}
	if (loop === undefined) {
		loop = false;
	}

	// Create an audio object
	if (!this.sound) {

		// Create a new sound object
		var sound = this.sound = new THREE.Audio( AudioCore.listener );
		AudioCore.makeResetable( sound );

		// Set loop
		this.sound.setLoop( loop );

		// Load buffer & play
		this.load(function( buffer ) {
			sound.setBuffer( buffer );
			sound.play();
		});

	} else {

		// Just play
		this.sound.setLoop( loop );
		this.sound.play();

	}

	// Register callback
	if (complete_cb) {
		this.sound.source.onended = (function() {
			THREE.Audio.prototype.onEnded.call(this.sound);
			complete_cb();
		}).bind(this);
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
