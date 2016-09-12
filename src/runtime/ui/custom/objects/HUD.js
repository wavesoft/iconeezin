/**
 * @author wavesoft / https://github.com/wavesoft
 */
var THREE = require('three');
require("../shaders/HUDShader");

/**
 * Maximum number of layers allowed
 */
const MAX_LAYERS = 5;

/**
 * HUD object that is placed on the camera in the scene and
 * renders the HUD UI with a custom shader.
 */
THREE.HUD = function () {
	THREE.Object3D.call( this );

	// Local properties
	this.hudLayers = [];
	this.size = new THREE.Vector2(0,0);
	this.pixelRatio = 1.0;

	// Initialize the shader material
	this.uniforms = THREE.UniformsUtils.clone( THREE.HUDShader.uniforms );
	this.material = new THREE.ShaderMaterial( {

		defines: THREE.HUDShader.defines || {},
		uniforms: this.uniforms,
		vertexShader: THREE.HUDShader.vertexShader,
		fragmentShader: THREE.HUDShader.fragmentShader,
		transparent: true

	} );

	// Move size vector as uniform
	this.uniforms['size'].value = this.size;

	// Create a quad that fills the screen
	var quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), this.material );
	quad.position.z = -0.25;
	this.add( quad );

}

THREE.HUD.prototype = Object.assign( Object.create( THREE.Object3D.prototype ), {

	constructor: THREE.HUD,

	addLayer: function( layer ) {

		// Check for a free layer
		var id = -1;
		for (var i=0; i<MAX_LAYERS; i++) {
			if (this.uniforms['layer_size'].value[i].x == 0) {
				id = i;
				break;
			}
		}
		if (id < 0) {
			console.warn("THREE.HUD: you can add up to "+MAX_LAYERS+" layers in the HUD.");
			return;
		}

		// Register layer on HUD
		layer.register( this, id );
		this.hudLayers.push( layer );

		return this;

	},

	removeLayer: function( layer ) {

		// Get layer
		var i = this.hudLayers.indexOf( layer );
		if (i === -1) return;

		// Unregister and remove
		layer.unregister();
		this.hudLayers.splice(i,1);
		return this;

	},

	setPixelRatio: function( ratio ) {

		// Update pixel ratio of all components
		this.pixelRatio = ratio;

		// Re-orient all layers
		for (var i=0; i<this.hudLayers.length; ++i) {
			this.hudLayers[i].setPixelRatio( this.pixelRatio );
		}

	},

	setSize: function( width, height ) {

		// Update size
		this.size.set( width, height );

		// Re-orient all layers
		for (var i=0; i<this.hudLayers.length; ++i) {
			this.hudLayers[i].updateUniforms();
		}

	},

	setFadeoutOpacity: function( value ) {

		// Update fade-out opacity
		this.uniforms['black_fader'].value = value;

	},

	setStereo: function( enabled ) {

		// Update size
		this.uniforms['stereo'].value = enabled;

	},

});
