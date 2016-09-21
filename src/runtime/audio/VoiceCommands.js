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

var jsDiff = require('diff');

/**
 * Normalize a word by removing accents and capitalizations
 */
function normalize( word ) {
	return word.toLowerCase()
		.replace(/[ά]/g,"α")
		.replace(/[έ]/g,"ε")
		.replace(/ο[ύυ]/g,"u")
		.replace(/(ο[ιί]|υ[ιί]|)/g,"ι")
		.replace(/α[ίι]/g,"ε")
		.replace(/[όώω]/g,"ο")
		.replace(/[ίύήϊϋΐΰυη]/g,"ι");
}

/**
 * Get matching information between the given two words
 * A is the 'reference' word and B is the 'spoken' word.
 *
 * Returns an array with the following fields:
 * [
 *    speaking progress,
 *    correctly matched percentage,
 * ]
 *
 */
function getProgressScore( a, b ) {

	// Calculate the diff between the two phrases
	var src = normalize(a), src_c = src.trim().split(/\s+/g).length;
	var cmp = normalize(b);
	var diff = jsDiff.diffWords( src, cmp );
	var good_c = 0, progress_c = 0, c = 0, anchored = false, removed_c = 0;

	// Process
	for (var i=0, l=diff.length; i<l; i++) {
		var change = diff[i];

		// Count words in this change
		c = change.value.trim().split(/\s+/g).length;
		if (!change.value.trim()) c=0;

		// Handle according to type
		if (change.added || change.removed) {

			// When we have an anchored result, account the
			// removed words from the sentence.
			if (anchored) {
				if (change.removed) {
					removed_c += c
				}
			}

		} else {

			// To calculate the progress we anchor to the
			// first matched part
			anchored = true;

			// Account good word count
			good_c += c;

			// Account for cases were a match was predecessed
			// with a couple of removed cords
			progress_c += c + removed_c; removed_c = 0;

		}

	}

	// Return progress and goodness ratio
	return [ progress_c / src_c, good_c / src_c ];
}

// Get the SpeechRecognition object, while handling browser prefixes
var SpeechRecognition = window.SpeechRecognition ||
                      window.webkitSpeechRecognition ||
                      window.mozSpeechRecognition ||
                      window.msSpeechRecognition ||
                      window.oSpeechRecognition;

/**
 * Voice Commands API
 */
var VoiceCommands = function() {

	// Check if speech recognition is available
	this.available = !!SpeechRecognition;
	if (!this.available) return;

	// Create an instance
	this.recognition = new SpeechRecognition();

	// Local properties
	this.active = false;
	this.resultsCallbacks = [];

	// Bind events
	this.recognition.onend = (function(e) {
		this.active = false;
		this.resultsCallbacks = [];
	}).bind(this);
	this.recognition.onstart = (function(e) {
		this.active = true;
	}).bind(this);
	this.recognition.onerror = (function(e) {
		console.error("Speech recognition error:",e);
		if (this.active) {
			this.active = false;
		}
		for (var i=0, l=this.resultsCallbacks.length; i<l; ++i)
			this.resultsCallbacks[i](null, e);
	}).bind(this);
	this.recognition.onresult = (function(e) {
		var result = e.results[e.resultIndex];
		// console.log("Heard: '" + e.results[0][0].transcript + "' (confidence="+ e.results[0][0].confidence + ")")
		for (var i=0, l=this.resultsCallbacks.length; i<l; ++i)
			this.resultsCallbacks[i](result, null);
	}).bind(this);

	// // Debug events
	// this.recognition.onaudiostart = (function(e) {
	// 	console.debug("Audio Start",e);
	// }).bind(this);
	// this.recognition.onaudioend = (function(e) {
	// 	console.debug("Audio End",e);
	// }).bind(this);
	// this.recognition.onsoundstart = (function(e) {
	// 	console.debug("Sound Start",e);
	// }).bind(this);
	// this.recognition.onsoundend = (function(e) {
	// 	console.debug("Sound End",e);
	// }).bind(this);
	// this.recognition.onspeechstart = (function(e) {
	// 	console.debug("Speech Start",e);
	// }).bind(this);
	// this.recognition.onspeechend = (function(e) {
	// 	console.debug("Speech End",e);
	// }).bind(this);

	// Configure
	// this.recognition.lang = 'el-GR';
	this.recognition.continuous = false;
	this.recognition.interimResults = true;

}

/**
 * Change audio language
 */
VoiceCommands.prototype.setLanguage = function( lang ) {
	this.recognition.lang = lang;
}

/**
 * Start audio dictation
 */
VoiceCommands.prototype.startDictation = function() {
	if (this.active) return;
	this.recognition.start();
};

/**
 * Reset state of voice commands API
 */
VoiceCommands.prototype.reset = function() {

	// Stop if active
	if (this.active) {
		this.active = false;
		this.recognition.abort();
	}

};

/**
 * Expect a phrase to be spoken.
 *
 * The progress callback will be fired with interim results and other metadata
 * regarding the speaking progress.
 */
VoiceCommands.prototype.expectPhrase = function( phrase, progress ) {

	// Create a callback delegate to receive speech events
	var last_confidence = 0;
	var cb = function( results, error ) {
		if (error) {
			return;
		}

		// Get match score
		var transcript = results[0].transcript,
			confidence = results[0].confidence,
			score = getProgressScore( phrase, transcript );

		// Keep track of last confidence (Because it bets 0 when completed)
		if (confidence === 0)
			confidence = last_confidence;
		last_confidence = confidence;

		// Prepare callback metadata
		var meta = {
			'completed': results.isFinal,
			'confidence': confidence,
			'progress': score[0],
			'score': score[1],
			'transcript': transcript
		};

		// Callback with progress
		if (progress) progress( meta );
		console.log(meta);

	};

	// Start dictation
	this.resultsCallbacks.push(cb);
	this.startDictation();

};

/**
 * Expect one of the given gommand(s)
 */
VoiceCommands.prototype.expectCommands = function( commands, error_cb ) {

	// Compile regex
	var _commands = Object.keys(commands).map(function (command) {
		return {
			regex: new RegExp(command),
			callback: commands[command]
		};
	});

	// Create a callback delegate to receive speech events
	var last_confidence = 0;
	var cb = function( results, error ) {
		if (error) {
			error_cb(error, null);
			return;
		}

		// Wait for final result
		if (results.isFinal) {
			var handled = false;
			var lastTranscript = '';

			// Iterate over result transcripts
			for (var i=0; i<results.length; i++) {
				var result = results[i];
				var transcript = result.transcript;
				if (handled) return;

				// Match commands
				_commands.forEach(function (command) {
					if (handled) return;

					// Find first matching command
					if (command.regex.exec(transcript)) {
						handled = true;
						command.callback(transcript);
					}
				});

				lastTranscript = transcript;
			}

			// If nothing matched, fire unknown callback
			if (!handled && error_cb) {
				error_cb(null, lastTranscript);
			}
		}

	};

	// Start dictation
	this.resultsCallbacks.push(cb);
	this.startDictation();

}

/**
 * Enable voice commands
 */
VoiceCommands.prototype.setPaused = function( isPaused ) {

}

/**
 * This function triggers a speech input and stops right when it gets
 * a confirmation. This is used only to probe the browser in order to
 * show the promt to the user.
 */
VoiceCommands.prototype.probeSupport = function( callback ) {

	// Check for missing support
	if (!SpeechRecognition) {
		callback(false, 'Missing speech recognition support');
		return;
	}

	// Create an instance
	var probeRecognition = new SpeechRecognition();
	var didStart = false;

	probeRecognition.onstart = function() {
		if (didStart) return;

		// Stop right away
		didStart = true;
		probeRecognition.stop();

		// Success callback
		callback(true);
	};
	probeRecognition.onerror = function() {
		if (didStart) return;
		// Erroreus callback
		callback(false);
	};

	// Start
	probeRecognition.start();

}

// Export
module.exports = VoiceCommands;
