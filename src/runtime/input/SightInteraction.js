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

var ThreeAPI = require("../../api/Three");

const C_DEFAULT = new THREE.Color( 0xffffff );
const C_SELECT = new THREE.Color( 0x0066ff );
const C_ERROR = new THREE.Color( 0xcc0000 );
const CENTER = new THREE.Vector2(0,0);

const SELECT_DURATION = 0.25;
const GAZE_DURATION = 0.75;

const ANIMATION_STEPS = 20;

/**
 * Sight interaction takes care of raycasting and intersecting
 * interesint objects.
 */
var SightInteraction = function( viewport ) {

	// Keep a reference to the viewport
	this.viewport = viewport;

	// Compile a few geometries for animating the circle
	this.animGeometries = [];
	for (var i=0; i<ANIMATION_STEPS-1; i++) {
		var ofs = Math.PI*2*(i/ANIMATION_STEPS);
		this.animGeometries.push(
			new THREE.RingGeometry( 0.02, 0.04, 20, 1, 
				Math.PI/2-ofs ,ofs )
		);
	}
	this.animGeometries.push( new THREE.RingGeometry( 0.02, 0.04, 20 ) );

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
	this.animCursor.position.z = -1.9;
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

	// Confirmation animation
	this.confirmAnimation = 1.0;

	// Create a raycaster
	this.raycaster = new THREE.Raycaster();
	this.raycaster.setFromCamera( { x: 0, y: 0 }, viewport.camera );

	// Interactive objects
	this.interactiveObjects = [];
	this.hoverObject = null;
	this.gazeTimer = 0;

	// Register render listener
	viewport.addRenderListener( this.onRender.bind(this) );

	// Register a few DOM events
	document.addEventListener( 'mousedown', this.handleMouseDown.bind(this), false );
	document.addEventListener( 'mouseup', this.handleMouseUp.bind(this), false );
	document.addEventListener( 'click', this.handleClick.bind(this), false );

}

/**
 * Set progression animation
 */
SightInteraction.prototype.setProgressionAnimation = function(v) {

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
SightInteraction.prototype.setHighlight = function( state ) {

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
SightInteraction.prototype.playConfirmation = function() {
	this.confirmAnimation = 0.0;
	this.confirmCursor.visible = true;
}

/**
 * Traverse scene and collect interesting objects
 */
SightInteraction.prototype.updateFromScene = function() {

	// Mouse out of last intersecting
	this.interactiveObjects = [];
	this.viewport.scene.traverse((e) => {
		if (e.__interact__ !== undefined) {
			this.interactiveObjects.push(e);
		}
	});

	console.log("Updated interactive objects:", this.interactiveObjects);

};

/**
 * Check interactions
 */
SightInteraction.prototype.handleMouseDown = function( event ) {
	if (!this.hoverObject) return;
	if (this.hoverObject.__interact__.onMouseDown)
		this.hoverObject.__interact__.onMouseDown( event );
}
SightInteraction.prototype.handleMouseUp = function( event ) {
	if (!this.hoverObject) return;
	if (this.hoverObject.__interact__.onMouseUp)
		this.hoverObject.__interact__.onMouseUp( event );
}
SightInteraction.prototype.handleClick = function( event ) {
	if (!this.hoverObject) return;

	// Trigger click event
	if (this.hoverObject.__interact__.onClick)
		this.hoverObject.__interact__.onClick();

	// Trigger interact event
	this.playConfirmation();
	if (this.hoverObject.__interact__.onInteract)
		this.hoverObject.__interact__.onInteract();

}

/**
 * Check interactions
 */
SightInteraction.prototype.onRender = function( delta ) {

	// Intersect interactive objects
	this.raycaster.setFromCamera( CENTER, this.viewport.camera );
	var intersects = this.raycaster.intersectObjects( this.interactiveObjects, true );

	// Trigger events
	if ( intersects.length > 0 ) {
		if (intersects[0].object !== this.hoverObject) {

			// Deselect previous object
			if (this.hoverObject) {

				// Hadle mouse out
				if (this.hoverObject.__interact__.onMouseOut)
					this.hoverObject.__interact__.onMouseOut();

				// Reset highlight
				this.setHighlight(0);

			}

			// Focus new object
			this.hoverObject = intersects[0].object;

			// Handle mouse over
			if (this.hoverObject.__interact__.onMouseOver)
				this.hoverObject.__interact__.onMouseOver();

			// Highlight if not gazing
			if ( this.hoverObject.__interact__.gaze ) {

				// Reset gaze state
				this.gazeTimer = 0;

			} else {

				// Just highlight without gazing
				this.gazeTimer = GAZE_DURATION;
				this.setHighlight(1);

			}


		} else {

			// User is gazing
			if (this.gazeTimer < GAZE_DURATION) {
				this.gazeTimer += delta / 1000;
				var gazeV = this.gazeTimer / GAZE_DURATION;
				if (gazeV > 1) gazeV = 1;

				// Apply gaze as a color
				this.setHighlight( gazeV );

				// Interact when user gazes long enough
				if (gazeV == 1) {
					this.playConfirmation();

					// Call interaction function
					if (this.hoverObject.__interact__.onInteract)
						this.hoverObject.__interact__.onInteract();

				}

			}

		}
	} else {
		if (this.hoverObject) {

			// Hadle mouse out
			if (this.hoverObject.__interact__.onMouseOut)
				this.hoverObject.__interact__.onMouseOut();
			this.hoverObject = null;

			// Reset gaze timer
			this.gazeTimer = 0;
			this.setHighlight(0);

		}
	}

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

}

// Export
module.exports = SightInteraction;
