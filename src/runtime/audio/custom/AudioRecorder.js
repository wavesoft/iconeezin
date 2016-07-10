/**
 * @author wavesoft / http://wavesoft.github.io/
 */

var THREE = require("three");

THREE.AudioRecorder = function ( listener, bufferLen ) {

	// Keep reference to listener, used for creating audio objects
	this.listener = listener;
	this.context = listener.context;

	// Create a script node
    var bufferLen = bufferLen || 4096;
    if(!this.context.createScriptProcessor){
       this.node = this.context.createJavaScriptNode(bufferLen, 2, 2);
    } else {
       this.node = this.context.createScriptProcessor(bufferLen, 2, 2);
    }

    // Register audio process function to record
    // the samples into the buffer chunks
    this.node.onaudioprocess = (function(e) {
    	if (this.isRecording) {

    		// Copy buffers and stack them to chunks
    		var in0;
		    this.chunksL.push( Array.prototype.slice.call(in0 = e.inputBuffer.getChannelData(0), 0) );
		    this.chunksR.push( Array.prototype.slice.call(e.inputBuffer.getChannelData(1), 0) );

    		// Calculate offset
    		this.recOffset += in0.length;

    	}
    }).bind(this);

	// Local properties
	this.onRecordCompleted = null;
    this.isRecording = false;
    this.chunksL = []; this.chunksR = [];
    this.recOffset = 0;

};

THREE.AudioRecorder.prototype = Object.assign( Object.create( THREE.Audio.prototype ), {

	constructor: THREE.AudioRecorder,

	record: function( input, completed_cb ) {

		// stop playback if any
		if (this.playing) this.stop();

		// Reset
		this.recOffset = 0;
		this.chunksR = [];
		this.chunksL = [];
		this.isRecording = true;
		this.onRecordCompleted = completed_cb;

		// Plug to correct audio node
		if (input instanceof AudioNode) {
			input.connect( this.node );
			this.node.connect( this.listener.getInput() );

		} else if (input instanceof THREE.Audio) {
			input.getOutput().connect( this.node );
			this.node.connect( this.listener.getInput() );

		} else {

			console.warn( 'THREE.AudioRecorder: unknown input passed to the record function.' );
			return;

		}

		return this;
	},

	stop: function() {

		// Stop recording or playing
		if (!this.isRecording) {

			console.warn( 'THREE.AudioRecorder: called stop() without calling record() first.' );
			return;

		}

		// Disconnect node
		this.node.disconnect();
		this.isRecording = false;

		// Create audio buffer
		var audioBuffer = this.context.createBuffer( 2, this.recOffset, this.context.sampleRate );

		// Merge chunks and fill buffer channels
		var offset = 0;
		var bufferL = audioBuffer.getChannelData(0);
		var bufferR = audioBuffer.getChannelData(1);
		for (var i = 0; i < this.chunksL.length; ++i){
			bufferL.set(this.chunksL[i], offset);
			bufferR.set(this.chunksR[i], offset);
			offset += this.chunksL[i].length;
		}

		// Reset chunks
		this.chunksL = [];
		this.chunksR = [];

		// Reset audio source
		this.source = this.context.createBufferSource();
		this.source.onended = this.onEnded.bind( this );

		// Create a THREE.Audio object with this recording
		var audio = new THREE.Audio( this.listener );
		audio.setBuffer( audioBuffer );

		// Return audio object
		return audio;

	}

} );
