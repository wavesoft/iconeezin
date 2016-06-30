/**
 * @author wavesoft / http://wavesoft.github.io/
 */

var THREE = require("three");

THREE.UserAudio = function ( listener ) {

	THREE.Audio.call( this, listener );

	// Source is oppened with setActive(true)
	this.source = null;

	// Local properties
	this.isPlaying = false;
	this.hasPlaybackControl = false;
	this.sourceType = 'linein';

};

THREE.UserAudio.prototype = Object.assign( Object.create( THREE.Audio.prototype ), {

	constructor: THREE.UserAudio,

	play: function( cb_error ) {
		if (this.isPlaying) return;

		// Handle user's positive response
		var handleStream = (function(stream) {

			// Create an AudioNode from the stream and plug it to gain
			this.source = this.context.createMediaStreamSource( stream );

			// Connect
			this.isPlaying = true;
			this.connect();

		}).bind(this);

		// Handle error
		var handleError = (function() {
			if (cb_error) cb_error();
		}).bind(this);

		// Find the appropriate function to use
		var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia 
							|| navigator.msGetUserMedia|| navigator.oGetUserMedia

		// Request to get user media
		getUserMedia.call( navigator, { audio:true }, handleStream, handleError );

		return this;
	},

	stop: function() {
		if (!this.isPlaying) return;

		// Deactivate
		this.disconnect();
		this.source = null;
		this.isPlaying = false;

		return this;
	}

} );
