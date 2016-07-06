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

THREE.HUDPass = function ( width, height, onUpdate ) {

	THREE.Pass.call( this );

	// Clone uniforms
	this.uniforms = THREE.UniformsUtils.clone( THREE.HUDShader.uniforms );
	this.material = new THREE.ShaderMaterial( {

		defines: THREE.HUDShader.defines || {},
		uniforms: this.uniforms,
		vertexShader: THREE.HUDShader.vertexShader,
		fragmentShader: THREE.HUDShader.fragmentShader

	} );

	// Global properties
	this.needsUpdate = true;
	this.autoUpdate = false;

	// Create a canvas for overlaying GUI
	this.canvas = document.createElement('canvas');

	// Snap canvas size to powers of 2
	this.canvas.width = Math.pow(2, Math.ceil(Math.log2(width)));
	this.canvas.height = Math.pow(2, Math.ceil(Math.log2(height)));
	this.size = new THREE.Vector2(0,0);
	this.setSize( this.width, this.height );

	// Create a canvas texture
	this.uniforms['hmd'].value = false;
	this.uniforms['tBack'].value = null;
	this.uniforms['tFront'].value = this.canvasTexture = new THREE.Texture( this.canvas );

	// Get context
	this.context = this.canvas.getContext('2d');
	this.canvasTexture.needsUpdate = true;

	// Update callback
	this.onUpdate = onUpdate;

	this.camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
	this.scene = new THREE.Scene();

	this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
	this.scene.add( this.quad );

};

THREE.HUDPass.prototype = Object.assign( Object.create( THREE.Pass.prototype ), {

	constructor: THREE.HUDPass,

	setSize: function( width, height ) {

		// Keep track of size
		this.size.set( width, height );

		// Apply hmd effect scale
		this.uniforms['size'].value.set(
			this.canvas.width / width,
			this.canvas.height / height
		);

	},

	setHMD: function( enabled ) {
		this.uniforms['hmd'].value = enabled;
	},

	render: function( renderer, writeBuffer, readBuffer, delta, maskActive ) {

		if ( this.uniforms[ this.textureID ] ) {

			this.uniforms[ this.textureID ].value = readBuffer.texture;

		}

		// Call update function
		if (this.onUpdate && (this.autoUpdate || this.needsUpdate)) {

			// Render update
			this.context.clearRect(0, 0, this.canvas.width, this.canvas.height );
			this.onUpdate( this.context, this.canvas.width, this.canvas.height );

			// Update texture
			this.canvasTexture.needsUpdate = true;
			this.needsUpdate = false;

		}

		// Update read buffer
		this.uniforms['tBack'].value = readBuffer.texture;
		this.quad.material = this.material;

		if ( this.renderToScreen ) {

			renderer.render( this.scene, this.camera );

		} else {

			renderer.render( this.scene, this.camera, writeBuffer, this.clear );

		}

	}

} );
