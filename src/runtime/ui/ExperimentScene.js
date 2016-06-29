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

/**
 * ExperimentScene can be used with crossfade effect
 */
var ExperimentScene = function( experiment, camera ) {

	// Clear color
	this.clearColor = 0x00;

	// Setup scene
	this.scene = experiment;

	// Setup camera
	this.camera = camera;

	// Create a framebuffer
	renderTargetParameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBuffer: false };
	this.fbo = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, renderTargetParameters );

	this.render = function( delta, rtt ) {

		this.mesh.rotation.x += delta * this.rotationSpeed.x;
		this.mesh.rotation.y += delta * this.rotationSpeed.y;
		this.mesh.rotation.z += delta * this.rotationSpeed.z;

		renderer.setClearColor( this.clearColor );


	};	

};

/**
 * Resize render target and camera
 */
ExperimentScene.prototype.resize = function( width, height ) {
	this.fbo.setSize( width, height );
};

/**
 * Render this scene through the 
 */
ExperimentScene.prototype.render = function( delta, rtt ) {

	// Check if we should render to the framebuffer
	if ( rtt )
		renderer.render( this.scene, this.camera, this.fbo, true );
	else
		renderer.render( this.scene, this.camera );

};

// Export experiment scene
module.exports = ExperimentScene;