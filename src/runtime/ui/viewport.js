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
var Browser = require("../util/Browser");
var HUDStatus = require("./HUDStatus");

// Modified version of example scripts
// in order to work with Z-Up orientation
require("./custom/shaders/SkyShader");

// Effect composer complex
require("three/examples/js/shaders/CopyShader");
require("three/examples/js/shaders/FXAAShader");

require("three/examples/js/postprocessing/EffectComposer");
require("three/examples/js/postprocessing/RenderPass");
require("three/examples/js/postprocessing/MaskPass");
require("three/examples/js/postprocessing/ShaderPass");

require("three/examples/js/shaders/DigitalGlitch");
require("three/examples/js/postprocessing/GlitchPass");

require("three/examples/js/shaders/BokehShader");
require("three/examples/js/postprocessing/BokehPass");

require("three/examples/js/shaders/SMAAShader");
require("three/examples/js/postprocessing/SMAAPass");

require("three/examples/js/shaders/FilmShader");
require("three/examples/js/postprocessing/FilmPass");

require("three/examples/js/shaders/ConvolutionShader");
require("three/examples/js/postprocessing/BloomPass");

require("three/examples/js/shaders/HueSaturationShader");

// VR Pass and HUD
require("./custom/postprocessing/VRPass");
require("./custom/objects/HUD");

/**
 * Our viewport is where everything gets rendered
 */
var Viewport = function( viewportDOM, vrHMD ) {

	/////////////////////////////////////////////////////////////
	// Properties
	/////////////////////////////////////////////////////////////

	/**
	 * Listeners that will be called upon every render() event
	 * @property
	 */
	this.renderListeners = [];

	/**
	 * Currently active tween functions
	 * @property
	 */
	this.tweenFunctions = [];

	/////////////////////////////////////////////////////////////
	// Constructor
	/////////////////////////////////////////////////////////////

	// Initialize properties
	this.viewportDOM = viewportDOM;
	this.paused = true;
	this.useHMD = false;
	this.experiments = [];
	this.activeExperiment = null;

	// DOM Size
	this.width = viewportDOM.offsetWidth;
	this.height = viewportDOM.offsetHeight;

	/////////////////////////////////////////////////////////////
	// Scene & Camera
	/////////////////////////////////////////////////////////////

	// Initialize a THREE scene
	this.scene = new THREE.Scene();

	// Initialize a camera (with dummy ratio)
	this.camera = new THREE.PerspectiveCamera( 75, 1.0, 0.1, 1000000 );

	// Camera looks towards +Y with Z up
	this.camera.up.set( 0.0, 0.0, 1.0 );
	this.camera.position.set( 0.0, 0.0, 0.0 );
	this.camera.rotation.set( Math.PI/2, 0, 0 );

	// Create Heads-up Display
	this.hud = new THREE.HUD();
	this.camera.add( this.hud );

	// Create a HUD display
	this.hudStatus = new HUDStatus( this );
	this.hud.addLayer( this.hudStatus );

	/////////////////////////////////////////////////////////////
	// Rendering
	/////////////////////////////////////////////////////////////

	// Initialize the renderer
	this.renderer = new THREE.WebGLRenderer({ antialias: true });
	this.renderer.autoClear = false;
	this.renderer.shadowMap.enabled = true;
	this.renderer.setPixelRatio( 1 );
	this.viewportDOM.appendChild( this.renderer.domElement );

	// Effect composer
	this.effectComposer = new THREE.EffectComposer( this.renderer );

	// Render pass in VR
	this.renderPass = new THREE.VRPass( this.scene, this.camera, vrHMD );
	this.renderPass.renderToScreen = true;
	this.effectComposer.addPass( this.renderPass );

	// Glitch pass
	this.glitchPass = new THREE.GlitchPass();
	this.glitchPass.goWild = true;
	this.glitchPass.renderToScreen = true;
	this.glitchPass.enabled = false;
	this.effectComposer.addPass( this.glitchPass );

	// Bloom pass
	this.bloomPass = new THREE.BloomPass();
	this.bloomPass.renderToScreen = true;
	this.bloomPass.enabled = false;
	this.effectComposer.addPass( this.bloomPass );

	// Bloom pass
	this.filmPass = new THREE.FilmPass();
	this.filmPass.renderToScreen = true;
	this.filmPass.enabled = false;
	this.effectComposer.addPass( this.filmPass );

	// FXAA anti-alias pass
	this.antialiasPass = new THREE.ShaderPass( THREE.FXAAShader );
	this.antialiasPass.setSize = (function( w, h ) {
		this.uniforms['resolution'].value.set( 1/w, 1/h );
	}).bind(this.antialiasPass)
	this.antialiasPass.enabled = false;
	this.antialiasPass.renderToScreen = true;
	this.effectComposer.addPass( this.antialiasPass );

	/////////////////////////////////////////////////////////////
	// Environment
	/////////////////////////////////////////////////////////////

	// Add Sky Mesh
	this.sky = new THREE.Sky();
	this.sky.uniforms.turbidity.value = 10;
	this.sky.uniforms.reileigh.value = 2;
	this.sky.uniforms.mieCoefficient.value = 0.005;
	this.sky.uniforms.mieDirectionalG.value = 0.8;
	this.sky.uniforms.luminance.value = 0.9;
	this.setSunPosition(0.20, 0.25);
	this.scene.add( this.sky.mesh );

	/////////////////////////////////////////////////////////////
	// Helpers
	/////////////////////////////////////////////////////////////

	// Add axis on 0,0,0
	var axisHelper = new THREE.AxisHelper( 5 );
	this.scene.add( axisHelper );

	// Initialize the sizes (apply actual size)
	this.setSize( this.viewportDOM.offsetWidth, this.viewportDOM.offsetHeight );

}

/**
 * Enable a pass by it's ID
 */
Viewport.prototype.setEffect = function( id, parameters ) {

	// Enable appropriate effect
	this.glitchPass.enabled = (id === 1);
	this.bloomPass.enabled = (id === 2);
	this.filmPass.enabled = (id === 3);

	// Hackfix for bloom bug
	this.antialiasPass.enabled = (id === 2);

	// Configure appropriate effect
	if (!parameters)
		parameters = {};

	// Use default value
	if (typeof parameters !== 'object')
		parameters = { 'value': parameters };

	// Handle effect parameters
	switch (id) {
		case 1:
			// [Glitch]
			this.glitchPass.goWild = !parameters['value'];
			break;
		case 2:
			// [Bloom]
			break;
		case 3:
			// [Film]
			if (parameters['value']) {
				if (parameters['value'] === 0) {
					this.filmPass.uniforms['nIntensity'].value = 0;
					this.filmPass.uniforms['sIntensity'].value = 0;
					this.filmPass.uniforms['sCount'].value = 0;
				} else {
					this.filmPass.uniforms['nIntensity'].value = parameters['value'] || 0.5;
					this.filmPass.uniforms['sIntensity'].value = Math.pow( parameters['value'], 4);
					this.filmPass.uniforms['sCount'].value = parseInt( 4096 * parameters['value'] );
				}
			} else {
				this.filmPass.uniforms['nIntensity'].value = parameters['nIntensity'] || 0.5;
				this.filmPass.uniforms['sIntensity'].value = parameters['sIntensity'] || 0.05;
				this.filmPass.uniforms['sCount'].value = parameters['sCount'] || 4096;
			}
			this.filmPass.uniforms['grayscale'].value = parameters['grayscale'] || 0;
			break;
	}

	// Disable render pass if an effect i active
	this.renderPass.renderToScreen = !(
		this.glitchPass.enabled ||
		this.bloomPass.enabled ||
		this.filmPass.enabled
	);
}

/**
 * Enable or diable antialias pass
 */
Viewport.prototype.setAntialias = function( enabled ) {
	// this.antialiasPass.enabled = enabled;
}

/**
 * Resize viewport to fit new size
 */
Viewport.prototype.setOpacity = function( value ) {
	this.hud.setFadeoutOpacity( 1.0 - value );
}

/**
 * Resize viewport to fit new size
 */
Viewport.prototype.setSunPosition = function( inclination, azimuth ) {

	var distance = 400000;
	var theta = Math.PI * ( inclination - 0.5 );
	var phi = 2 * Math.PI * ( azimuth - 0.5 );

	var position = new THREE.Object3D();
	position.x = distance * Math.cos( phi );
	position.z = distance * Math.sin( phi ) * Math.sin( theta );
	position.y = distance * Math.sin( phi ) * Math.cos( theta );

	this.sky.uniforms.sunPosition.value.copy( position );

}

/**
 * Resize viewport to fit new size
 */
Viewport.prototype.setSize = function( width, height, pixelRatio, skipStyleUpdate ) {

	// Get size of the viewport
	this.width = width;
	this.height = height;

	// Update camera
	this.camera.aspect = width / height;
	this.camera.updateProjectionMatrix();

	// Update renderer
	this.renderer.setPixelRatio( pixelRatio || 1 );
	this.renderer.setSize( width, height, !skipStyleUpdate );

	// Update VR Composer size
	this.effectComposer.setSize( width, height );

	// Re-render if paused
	if (this.paused)
		this.render();

	// Re-orient hud
	this.hud.setSize( width, height );

}

/**
 * Add a render listener
 * @param {function} listener - The listener function to call before rendering the scene
 */
Viewport.prototype.addRenderListener = function( listener ) {
	// Add listener on list
	this.renderListeners.push( listener );
}

/**
 * Remove a render listener
 * @param {function} listener - The listener function to remove
 */
Viewport.prototype.removeRenderListener = function( listener ) {
	// Query
	var i = this.renderListeners.indexOf(listener);
	if (i < 0) return;
	// Remove
	this.renderListeners.splice(i,1);
}

/**
 * Render content
 */
Viewport.prototype.render = function() {

	// Schedule next frame if not paused
	// if (!this.paused) requestAnimationFrame( this.render.bind(this) );
	if (!this.paused) setTimeout( this.render.bind(this), 1000/10 );

	// Get elapsed time to update animations
	var t = Date.now(),
		d = t - this.lastTimestamp;
		this.lastTimestamp = t;

	// Perform scene updates only if not paused
	//
	// (Render events might still be triggered ex. when window
	//  resizes. This should not update the scene though...)
	//
	if (!this.paused) {

		// Call render listeners
		for (var i=0; i<this.renderListeners.length; i++) {
			this.renderListeners[i]( d, t );
		}

		// Update experiments
		for (var i=0; i<this.experiments.length; i++) {
			this.experiments[i].onUpdate( d );
		}

	}

	// Render composer
	this.renderer.clear();
	this.effectComposer.render( d );

}

/**
 * Define the HMD Device to use
 */
Viewport.prototype.setHMDDevice = function( device ) {
	this.renderPass.vrHMD = device;
}

/**
 * Enable or disable the Head-Mounted Display view
 */
Viewport.prototype.setHMD = function( enabled ) {

	// Set the HMD flag
	this.useHMD = enabled;

	// Enable stereo effect on HUD
	this.hud.setStereo( enabled );

}

/**
 * Start or stop animation
 */
Viewport.prototype.setPaused = function( paused ) {

	// Start scene if paused
	if (this.paused && !paused) {
		this.paused = false;
		this.lastTimestamp = Date.now();
		this.render();

	// Pause scene if animating
	} else if (!this.paused && paused) {
		this.paused = true;

	}

}

/**
 * Run the callback tween function for the given duration
 *
 * @param {int} duration - Tween duration
 * @param {function} fn - Tween function
 * @param {function} cb - Completed callback
 */
Viewport.prototype.runTween = function( duration, fn, cb ) {

	// Calculate tween details
	var duration = duration || 1000,
		progressPerMs = 1.0 / duration,
		tweenProgress = 0, scope = this;

	// Fade them in
	var tweenFunction = function( delta, ts ) {

		// Wrap bounds
		if (tweenProgress > 1.0) tweenProgress = 1.0;

		// Apply tween
		if (fn) fn( tweenProgress, delta, ts );

		// Handle termination
		if (tweenProgress == 1.0) {
			scope.removeRenderListener( tweenFunction );
			var i = scope.tweenFunctions.indexOf( tweenFunction );
			scope.tweenFunctions.splice(i,1);
			if (cb) cb();
		}

		// Update progress
		tweenProgress += progressPerMs * delta;

	};

	// Register tween function
	this.addRenderListener( tweenFunction );
	this.tweenFunctions.push( tweenFunction );

}

/**
 * Reset everything
 */
Viewport.prototype.reset = function( ) {

	// Remove all active tweens
	for (var i=0; i<this.tweenFunctions.length; i++) {
		this.removeRenderListener(this.tweenFunctions[i]);
	}

	// Reset HUD
	this.hudStatus.reset();
	this.setEffect(0);

}

// Export viewport
module.exports = Viewport;

