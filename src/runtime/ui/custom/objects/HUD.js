/**
 * @author wavesoft / https://github.com/wavesoft
 */
var THREE = require('three');
require("../shaders/HUDShader");

/**
 * Maximum number of layers allowed
 */
const MAX_LAYERS = 4;

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
		for (var i=1; i<=MAX_LAYERS; i++) {
			if (this.uniforms['layer'+i+'_size'].value.x == 0) {
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

});

/**
 * A HUD layer contains drawable and addressable information
 */
THREE.HUDLayer = function ( width, height, anchor ) {

	// Link information
	this.id = null;
	this.hud = null;
	this.pixelRatio = 1.0;

	// Local properties
	this.anchor = anchor || 'tl';
	this.size = new THREE.Vector2( width, height );
	this.position = new THREE.Vector2( 0, 0 );

	this.uniforms = {
		'size': new THREE.Vector2(0,0),
		'pos': new THREE.Vector2(0,0),
		'tex': null
	};

	// Create a 2D canvas
	this.canvas = document.createElement('canvas');
	this.context = this.canvas.getContext('2d');
	this.setSize( width, height );

	// Create texture using the canvas
	this.uniforms.tex = new THREE.Texture( this.canvas );
	this.uniforms.tex.needsUpdate = true;

}

THREE.HUDLayer.prototype = {
	constructor: THREE.HUDLayer,

	register: function( hud, layer_id ) {

		// Update uniforms
		this.id = layer_id;
		this.hud = hud;
		this.hud.uniforms['layer'+layer_id+'_size'].value = this.uniforms.size;
		this.hud.uniforms['layer'+layer_id+'_pos'].value = this.uniforms.pos;
		this.hud.uniforms['layer'+layer_id+'_tex'].value = this.uniforms.tex;

		// Adapt pixel ratio from HUD
		this.setPixelRatio( this.hud.pixelRatio );

		// Update uniforms
		this.updateUniforms();
		this.redraw();

	},

	unregister: function() {

		// Unregister
		this.hud.uniforms['layer'+this.id+'_size'].value = new THREE.Vector2(0,0);
		this.hud.uniforms['layer'+this.id+'_pos'].value = new THREE.Vector2(0,0);
		this.hud.uniforms['layer'+this.id+'_tex'].value = null;
		this.id = null;
		this.hud = null;

	},

	setPosition: function( x, y ) {

		// Set position & Update uniforms
		this.position.set( x, y );
		this.updateUniforms();

	},

	setAnchor: function( anchor ) {

		// Set anchor & Update uniforms
		this.anchor = anchor;
		this.updateUniforms();

	},

	setPixelRatio: function( ratio ) {

		// Set anchor & Update uniforms
		this.pixelRatio = ratio;
		this.setSize( this.size.x, this.size.y );

	},

	setSize: function( width, height ) {

		// Snap canvas to multiplicants of power of 2
		this.canvas.width = Math.pow(2, Math.ceil(Math.log2(width))) * this.pixelRatio;
		this.canvas.height = Math.pow(2, Math.ceil(Math.log2(height))) * this.pixelRatio;
		this.canvas.style = "width: "+width+"px; height: "+height+" px;";

		// Keep real size available
		this.size.set( width, height );

		// Update uniforms
		this.updateUniforms();
		this.redraw();

	},

	updateUniforms: function() {

		// Skip if disposed or not registered
		if (!this.canvas) return;
		if (!this.hud) return;

		//
		// Update size
		//
		this.uniforms.size.set( this.canvas.width, this.canvas.height );

		//
		// Depending on anchor alignment, update position uniform
		//
		switch (this.anchor[0].toLowerCase()) {
			case 't':
				this.uniforms.pos.y = (this.hud.size.y - this.canvas.height) - this.position.y;
				break;
			case 'c':
				this.uniforms.pos.y = (this.hud.size.y - this.size.y) / 2 - (this.canvas.height - this.size.y) - this.position.y;
				break;
			case 'b':
				this.uniforms.pos.y = (this.size.y - this.canvas.height) + this.position.y;
				break;
			default:
				console.warn("THREE.HUD: unknown anchor argument '"+this.anchor[0]+"'. Expecting 't','c','b'.")
				break;
		}
		switch (this.anchor[1].toLowerCase()) {
			case 'l':
				this.uniforms.pos.x = this.position.x;
				break;
			case 'c':
				this.uniforms.pos.x = this.hud.size.x/2 - this.size.x/2 + this.position.x;
				break;
			case 'r':
				this.uniforms.pos.x = (this.hud.size.x - this.size.x) + this.position.x;
				break;
			default:
				console.warn("THREE.HUD: unknown anchor argument '"+this.anchor[1]+"'. Expecting 'l','c','r'.")
				break;
		}

		//
		// Round position
		//
		this.uniforms.pos.set(
			Math.round(this.uniforms.pos.x),
			Math.round(this.uniforms.pos.y)
		);

		// console.log("HUD Layer",this.id,"at (",this.uniforms.pos.x,",",this.uniforms.pos.y,") size=(",
		// 	this.uniforms.size.x,",",this.uniforms.size.y,") with HUD=(",this.hud.size.x,",",this.hud.size.y,")");

	},

	redraw: function() {

		// Skip if disposed or not registered
		if (!this.canvas) return;
		if (!this.hud) return;

		// Call user's paint method to draw the canvas
		this.context.clearRect( -1, -1, this.canvas.width+2, this.canvas.height+2 );
		this.context.save();
		this.context.translate(0.5,0.5);
		this.onPaint( this.context, this.size.x, this.size.y );
		this.context.restore();

		// Update texture
		this.uniforms.tex.needsUpdate = true;

	},

	dispose: function() {

		// Unregister from HUD
		this.unregister();

		// Release resources
		this.context = null;
		this.canvas = null;

	},

	onPaint: function( ctx, width, height ) {

		// Must be implemented by the user to draw the layer contents

	},

};