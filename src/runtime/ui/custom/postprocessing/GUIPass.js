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

THREE.GUIPass = function ( width, height, onUpdate ) {

	THREE.Pass.call( this );

	// Clone uniforms
	this.uniforms = THREE.UniformsUtils.clone( THREE.OverlayShader.uniforms );
	this.material = new THREE.ShaderMaterial( {

		defines: THREE.OverlayShader.defines || {},
		uniforms: this.uniforms,
		vertexShader: THREE.OverlayShader.vertexShader,
		fragmentShader: THREE.OverlayShader.fragmentShader

	} );

	// Create a canvas for overlaying GUI
	this.canvasOffset = new THREE.Vector2(0,0);
	this.canvasSize = new THREE.Vector2(0,0);
	this.canvas = document.createElement('canvas');
	this.setSize( width, height );

	// Create a canvas texture
	this.uniforms['tFront'].value = this.canvasTexture = new THREE.Texture( this.canvas );

	// Get context
	this.context = this.canvas.getContext('2d');
	this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	this.canvasTexture.needsUpdate = true;

	// Update callback
	this.onUpdate = onUpdate;

	this.camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
	this.scene = new THREE.Scene();

	this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
	this.scene.add( this.quad );

};

THREE.GUIPass.prototype = Object.assign( Object.create( THREE.Pass.prototype ), {

	constructor: THREE.GUIPass,

	setSize: function( width, height ) {

		// Snap to powers of 2
		this.canvas.width = Math.pow(2, Math.ceil(Math.log2(width)));;
		this.canvas.height = Math.pow(2, Math.ceil(Math.log2(height)));;

		// Calculate offset
		this.canvasOffset.set( 
			(this.canvas.width - width)/2, 
			(this.canvas.height - height)/2 
		);

		// Save actual size
		this.canvasSize.set( width, height );

	},

	render: function( renderer, writeBuffer, readBuffer, delta, maskActive ) {

		if ( this.uniforms[ this.textureID ] ) {

			this.uniforms[ this.textureID ].value = readBuffer.texture;

		}

		// Call update function
		if (this.onUpdate) {

			this.context.clearRect(0, 0, this.canvasSize.x, this.canvasSize.y );

			// Apply transformation and render
			this.context.save();
			this.context.translate(this.canvasOffset.x, this.canvasOffset.y);
			this.onUpdate( this.context, this.canvas.width, this.canvas.height );
			this.context.restore();

			// Update texture
			this.canvasTexture.needsUpdate = true;

		}

		// Update read buffer
		this.uniforms['tBack'].value = readBuffer;
		this.quad.material = this.material;

		if ( this.renderToScreen ) {

			renderer.render( this.scene, this.camera );

		} else {

			renderer.render( this.scene, this.camera, writeBuffer, this.clear );

		}

	}

} );
