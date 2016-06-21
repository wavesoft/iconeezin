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

var WebAudiox = require("webaudiox");

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
	 * The web audio context
	 * @property
	 */
	this.context = new AudioContext();

	/**
	 * The line in from the user's microphone
	 * @property
	 */
	this.lineIn = null;

	/**
	 * The line out to the user's speakers
	 * @property
	 */
	this.lineOut = new WebAudiox.LineOut( this.context );

}

/**
 * Enable or disable microphone
 * @param {bool} enabled - Set to true to enable microphone
 */
AudioCore.enableLineIn = function( enabled ) {

	if (this.lineIn && !enabled) {

		//
		// Disable microphone
		//
		this.lineIn.stop();
		this.lineIn = null;

	} else if (!this.lineIn && enabled) {

		//
		// Open microphone input
		//

		// Handle user's positive response
		var handleStream = ((stream) => {
			// Create an AudioNode from the stream.
			this.lineIn = this.context.createMediaStreamSource( stream );

			var synthDelay = this.context.createDelay();
			this.lineIn.connect(synthDelay);
			synthDelay.connect(this.lineOut.destination);
			synthDelay.delayTime.value = 1.0;

		});

		// Handle user's negative response
		var handleError = (() => {
			// Display error
			alert("Unable to open audio input stream!");
		});

		// Get user media
		navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia|| navigator.oGetUserMedia;
		navigator.getUserMedia( {audio:true}, handleStream, handleError );

	}

}

/**
 * Play a sound buffer
 */
AudioCore.play = function ( buffer, loop ) {

	// init AudioBufferSourceNode
	var source = this.context.createBufferSource();
	source.buffer = buffer
	source.loop = (loop !== undefined) ? loop : false;
	source.connect( this.lineOut.destination );

	// start the sound now
	source.start(0);

}

/**
 * Apply a global mute on all audio
 */
AudioCore.setGlobalMute = function( enabled ) {

}

// Export
module.exports = AudioCore;
