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

const C_PROGRESS = new THREE.Color( 0xff9900 );
const C_DEFAULT = new THREE.Color( 0xffffff );
const C_SELECT = new THREE.Color( 0x0066ff );
const C_ERROR = new THREE.Color( 0xcc0000 );

const RING_SIZE = 0.03;
const RING_THCKNESS = 0.02;

const ANIMATION_STEPS = 40;

/**
 * Sight interaction takes care of raycasting and intersecting
 * interesint objects.
 */
var Cursor = function( viewport ) {

	// Keep a reference to the viewport
	this.viewport = viewport;

	// Compile a few geometries for animating the circle
	this.animGeometries = [];
	for (var i=0; i<ANIMATION_STEPS-1; i++) {
		var ofs = Math.PI*2*(i/ANIMATION_STEPS);
		this.animGeometries.push(
			new THREE.RingGeometry( RING_SIZE, RING_SIZE + RING_THCKNESS, 30, 
				1, Math.PI/2-ofs ,ofs )
		);
	}
	// Add the final full-ring geometry
	this.animGeometries.push( 
		new THREE.RingGeometry( RING_SIZE, RING_SIZE + RING_THCKNESS, 30 ) 
	);

	// Create a cursor
	this.cursor = new THREE.Mesh(
		this.animGeometries[ANIMATION_STEPS-1],
		new THREE.MeshBasicMaterial( {
			color: C_DEFAULT,
			opacity: 0.5,
			transparent: true
		} )
	);
	this.cursor.position.z = -2;

	// Create an animation geometry
	this.animCursor = new THREE.Mesh(
		this.animGeometries[1],
		new THREE.MeshBasicMaterial( {
			color: C_SELECT
		} )
	);
	this.animCursor.position.z = -1.99;
	this.animCursor.visible = false;

	// Create a confirmation cursor
	this.confirmCursor = new THREE.Mesh(
		new THREE.RingGeometry( 0.01, 0.06, 32 ),
		new THREE.MeshBasicMaterial( {
			color: C_DEFAULT,
			opacity: 1.0,
			transparent: true
		} )
	);
	this.confirmCursor.position.z = -3;
	this.confirmCursor.visible = false;

	// Put it on the camera
	this.viewport.camera.add( this.cursor );
	this.viewport.camera.add( this.animCursor );
	this.viewport.camera.add( this.confirmCursor );

	// Create a spinner sprite
	var loader = new THREE.TextureLoader();
	loader.load( require('../../img/loading.png'), (function( texture ) {

		// Create sprite material
		var mat = new THREE.SpriteMaterial({
			map: texture,
			transparent: true,
			opacity: 1.0,
			useScreenCoordinates: false,
			color: 0xffffff
		});

		// Sprite shown at loading time
		this.loadingSprite = new THREE.Sprite( mat );
		this.loadingSprite.position.z = -10;
		this.loadingSprite.visible = false;
		this.viewport.camera.add( this.loadingSprite );

	}).bind(this));

	// Confirmation animation
	this.confirmAnimation = 1.0;

	// Progress helpers
	this.progressActive = false;

	// Register render listener
	viewport.addRenderListener( this.onRender.bind(this) );

}

/**
 * Set progression animation
 */
Cursor.prototype.setProgressionAnimation = function(v) {

	// Hide if v=0
	if (v === 0) {
		this.animCursor.visible = false;

	// Pick appropriate geometry if v>1
	} else {
		
		// Calculate animation step
		var i = parseInt( Math.floor( v * ANIMATION_STEPS ) );
		if (i >= ANIMATION_STEPS) i=ANIMATION_STEPS-1;

		// Apply geometry
		this.animCursor.visible = true;
		this.animCursor.geometry = this.animGeometries[i];

	}

}

/**
 * Change the highlight of the cursor
 */
Cursor.prototype.setHighlight = function( state ) {

	if (state == 0) { /* Default */
		this.cursor.material.color.copy( C_DEFAULT );
		this.cursor.material.opacity = 0.5;
		this.setProgressionAnimation( 0 );

	} else if (state <= 1.0) { /* Fade to selection */

		// Lerp to selection
		this.animCursor.material.color.copy( C_SELECT );
		this.setProgressionAnimation( state );

	} else if (state <= 2.0) { /* Fade to error */

		// Lerp to selection
		this.animCursor.material.color.copy( C_ERROR );
		this.setProgressionAnimation( state - 1.0 );

	}

}

/**
 * Play confirmation animation
 */
Cursor.prototype.playConfirmation = function() {
	this.confirmAnimation = 0.0;
	this.confirmCursor.visible = true;
}

/**
 * Show loading indicator
 */
Cursor.prototype.showLoading = function( icon ) {
	if (this.progressActive) return;
	this.progressActive = true;

	// Set color to loading
	this.animCursor.material.color.copy( C_PROGRESS );
	this.loadingSprite.visible = true;

	// Tween scaling
	this.viewport.runTween( 250, (function(tweenProgress) {

		// Apply scale
		this.animCursor.scale.setScalar( 1 + 3 * tweenProgress );
		this.cursor.scale.setScalar( 1 + 3 * tweenProgress );
		this.loadingSprite.material.opacity = tweenProgress;

	}).bind(this));

}

/**
 * Hide loading indicator
 */
Cursor.prototype.hideLoading = function( ) {
	if (!this.progressActive) return;
	this.progressActive = false;

	// Reset progress bar
	this.setProgressionAnimation(0);
	this.animCursor.material.color.copy( C_DEFAULT );

	// Tween scaling
	this.viewport.runTween( 250, (function(tweenProgress) {

		// Apply scale
		this.animCursor.scale.setScalar( 1 + 3 * (1 - tweenProgress) );
		this.cursor.scale.setScalar( 1 + 3 * (1 - tweenProgress) );
		this.loadingSprite.material.opacity = (1-tweenProgress);

	}).bind(this), (function() {

		// Hide loading sprite
		this.loadingSprite.visible = false;

	}).bind(this));

}

/**
 * Handle loading progress
 */
Cursor.prototype.setLoadingProgress = function( percent ) {
	if (!this.progressActive) this.showLoading();
	this.setProgressionAnimation( percent );
}

/**
 * Check interactions
 */
Cursor.prototype.onRender = function( delta ) {

	// Update possible confirmation animation
	if (this.confirmAnimation < 1.0) {

		// Graduately zoom out while fading out
		this.confirmCursor.scale.setScalar( 1.0 + 10.0 * this.confirmAnimation );
		this.confirmCursor.material.opacity = 1.0 - this.confirmAnimation;

		// Update animation (0.25 seconds)
		this.confirmAnimation += (delta / 1000) / 0.25;
		if (this.confirmAnimation > 1) {
			this.confirmAnimation = 1.0;
			this.confirmCursor.visible = false;
		}

	}

	// Rotate visible loading sprite
	if (this.loadingSprite.visible) {
		this.loadingSprite.material.rotation -= 0.02;
	}

}

// Export
module.exports = Cursor;
