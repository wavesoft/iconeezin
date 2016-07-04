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
var Label = require("./Label");
var Browser = require("../util/Browser");

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

require("three/examples/js/shaders/HueSaturationShader");

// Custom pass for rendering the HMD display in a texture
// for possible post-processing.
require("./custom/postprocessing/VRPass");

require("./custom/shaders/OverlayShader");
require("./custom/postprocessing/GUIPass");

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

	/////////////////////////////////////////////////////////////
	// Rendering
	/////////////////////////////////////////////////////////////

	// Initialize the renderer
	this.renderer = new THREE.WebGLRenderer({ antialias: true });
	this.renderer.setPixelRatio( window.devicePixelRatio );
	this.viewportDOM.appendChild( this.renderer.domElement );

	// Camera opacity
	var black = new THREE.MeshBasicMaterial({
		color: 0x00,
		opacity: 0.5,
		transparent: true
	});
	this.opacityQuad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), black );
	this.opacityQuad.position.z = -0.25;
	this.opacityQuad.visible = false;
	this.camera.add( this.opacityQuad );

	// Effect composer
	this.effectComposer = new THREE.EffectComposer( this.renderer );

	// Render pass
	this.renderPass = new THREE.VRPass( this.scene, this.camera, vrHMD );
	this.renderPass.renderToScreen = true;
	this.effectComposer.addPass( this.renderPass );

	// // Antialias pass
	// this.antialiasPass = new THREE.SMAAPass( this.width, this.height );
	// this.antialiasPass.renderToScreen = false;
	// this.effectComposer.addPass( this.antialiasPass );

	// FXAA anti-alias pass
	// this.antialiasPass = new THREE.ShaderPass( THREE.FXAAShader );
	// this.antialiasPass.setSize = (function(w,h) {
	// 	this.uniforms[ 'resolution' ].value.set( 1 / w, 1 / h );
	// }).bind(this.antialiasPass);
	// this.antialiasPass.renderToScreen = false;
	// this.effectComposer.addPass( this.antialiasPass );

	// var effect = new THREE.BokehPass( this.scene, this.camera, {} );
	// effect.renderToScreen = true;
	// this.effectComposer.addPass( effect );

	// // Glitch pass
	// this.glitchPass = new THREE.GlitchPass();
	// this.glitchPass.renderToScreen = true;
	// this.glitchPass.goWild = false;
	// this.effectComposer.addPass( this.glitchPass );

	// FXAA anti-alias pass
	// var shader = new THREE.ShaderPass( THREE.HueSaturationShader );
	// shader.renderToScreen = true;
	// shader.uniforms['saturation'].value = -1.0;
	// this.effectComposer.addPass( shader );

	// // Add GUI
	// this.guiPass = new THREE.GUIPass( this.width, this.height, function(ctx, width, height) {

	// 	ctx.fillStyle = "green";
	// 	ctx.fillRect( 50,60,100,100);

	// });
	// this.guiPass.renderToScreen = true;
	// this.effectComposer.addPass( this.guiPass );

	// Initialize HMD effect
	// this.vrComposerEffect = new THREE.VRComposerEffect( this.effectComposer, this.renderPass );

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

	/////////////////////////////////////////////////////////////
	// Cursor label
	/////////////////////////////////////////////////////////////

	// Create label
	this.label = new Label("");
	this.label.position.set( 0, 0.3, -3.5 );
	this.label.scale.set( 4, 4, 1 );
	this.camera.add( this.label );

	// Initialize the sizes (apply actual size)
	this.setSize( this.viewportDOM.offsetWidth, this.viewportDOM.offsetHeight );

}

/**
 * Resize viewport to fit new size
 */
Viewport.prototype.setOpacity = function( value ) {
	if (value <= 0) {
		this.opacityQuad.visible = true;
		this.opacityQuad.material.opacity = 1.0;
	} else if (value >= 1) {
		this.opacityQuad.visible = false;
	} else {
		this.opacityQuad.visible = true;
		this.opacityQuad.material.opacity = 1.0 - value;
	}
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
	this.renderer.setPixelRatio( pixelRatio || window.devicePixelRatio );
	this.renderer.setSize( width, height, !skipStyleUpdate );

	// Update VR Composer size
	this.effectComposer.setSize( width, height );

	// Update effects
	// this.guiPass.setSize( width, height );

	// Update antialias
	// this.antialiasPass.setSize( width, height );
	// this.fxaaPass.uniforms[ 'resolution' ].value.set( 1 / width, 1 / height );

	// Re-render if paused
	if (this.paused)
		this.render();

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
	if (!this.paused) requestAnimationFrame( this.render.bind(this) );

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
		
	// // Render scene
	// if (this.useHMD) {
	// 	// Use HMD Effect for rendering the sterep image
	// 	this.hmdEffect.render( this.scene, this.camera );
	// } else {
	// 	// Otherwise use classic renderer
	// 	this.renderer.render( this.scene, this.camera );
	// }

	// Render composer
	this.effectComposer.render( d );
	// this.hmdEffect.vrHMD.submitFrame();
	// this.vrComposerEffect.render( d );

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
 * Add an experiment to the viewport
 *
 * @param {ExperimentBase} experiment - The experiment to add
 */
Viewport.prototype.addExperiment = function( experiment ) {

	// Store experiment in registry
	this.experiments.push( experiment );

	// Add objects
	this.scene.add( experiment.scene );

	// Separate lignts from the scene
	var lights = [];
	experiment.scene.traverse(function(obj) {
		if (obj instanceof THREE.Light) {
			lights.push( obj );
		}
	});
	experiment._lights = lights;

	// Turn off the lights
	for (var i=0; i<lights.length; i++) {

		// Keep original color & Turn light off
		lights[i]._originalColor = lights[i].color.getHex();
		lights[i].color.setHex( 0x000000 );

	}

	// If we had no active experiment so far, activate it too
	this.activateExperiment( experiment );

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
			if (cb) cb();
		}

		// Update progress
		tweenProgress += progressPerMs * delta;

	};

	// Register tween function
	this.addRenderListener( tweenFunction );

}

// Export viewport
module.exports = Viewport;
