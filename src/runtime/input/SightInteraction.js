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

var VideoCore = require("../core/VideoCore");
var TrackingCore = require("../core/TrackingCore");
var ThreeAPI = require("../../api/Three");

const CENTER = new THREE.Vector2(0,0);

const SELECT_DURATION = 0.25;
const GAZE_DURATION = 0.75;

/**
 * Sight interaction takes care of raycasting and intersecting
 * interesint objects.
 */
var SightInteraction = function( cursor, viewport ) {

	// Keep references
	this.cursor = cursor;
	this.viewport = viewport;

	// Create a raycaster
	this.raycaster = new THREE.Raycaster();
	this.raycaster.setFromCamera( { x: 0, y: 0 }, viewport.camera );

	// Interactive objects
	this.interactiveObjects = [];
	this.hoverObject = null;
	this.hoverInteraction = null;
	this.gazeTimer = 0;

	// Register render listener
	viewport.addRenderListener( this.onRender.bind(this) );

	// Register a few DOM events
	document.addEventListener( 'mousedown', this.handleMouseDown.bind(this), false );
	document.addEventListener( 'mouseup', this.handleMouseUp.bind(this), false );
	document.addEventListener( 'touchstart', this.handleMouseDown.bind(this), false );
	document.addEventListener( 'touchend', this.handleMouseUp.bind(this), false );
	document.addEventListener( 'click', this.handleClick.bind(this), false );
	document.addEventListener( 'touchend', this.handleClick.bind(this), false );

}

/**
 * Traverse scene and collect interesting objects
 */
SightInteraction.prototype.updateFromScene = function() {

	// Mouse out of last intersecting
	this.interactiveObjects = [];
	this.viewport.scene.traverse((function(e) {
		if (e.__interact__ !== undefined) {
			this.interactiveObjects.push(e);
		}
	}).bind(this));

};

/**
 * Check interactions
 */
SightInteraction.prototype.handleMouseDown = function( event ) {
	if (!this.hoverInteraction) return;
	if (this.hoverInteraction.onMouseDown)
		this.hoverInteraction.onMouseDown( event );
}
SightInteraction.prototype.handleMouseUp = function( event ) {
	if (!this.hoverInteraction) return;
	if (this.hoverInteraction.onMouseUp)
		this.hoverInteraction.onMouseUp( event );
}
SightInteraction.prototype.handleClick = function( event ) {
	if (!this.hoverInteraction) return;

	// Trigger click event
	if (this.hoverInteraction.onClick)
		this.hoverInteraction.onClick();

	// Trigger interact event
	this.cursor.playConfirmation();
	if (this.hoverInteraction.onInteract)
		this.hoverInteraction.onInteract();

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
				if (this.hoverInteraction.onMouseOut)
					this.hoverInteraction.onMouseOut();

				// Stop tracking
				if (this.hoverInteraction.trackID) {
					TrackingCore.trackEnd('interact.gaze');
				}

				// Reset highlight
				this.cursor.setHighlight(0);

				// Hide interaction label
				VideoCore.hideInteractionLabel();

			}

			// Focus new object
			this.hoverObject = intersects[0].object;
			this.hoverInteraction = this.hoverObject.__interact__;

			// Handle mouse over
			if (this.hoverInteraction.onMouseOver)
				this.hoverInteraction.onMouseOver();

			// Start tracking
			if (this.hoverInteraction.trackID) {
				TrackingCore.trackStart('interact.gaze', { 'id': this.hoverInteraction.trackID });
			}

			// Highlight if not gazing
			if ( this.hoverInteraction.gaze ) {

				// Reset gaze state
				this.gazeTimer = 0;

			} else {

				// Just highlight without gazing
				this.gazeTimer = GAZE_DURATION;
				this.cursor.setHighlight(1);

			}

			// Show interaction label
			if (this.hoverInteraction.title)
				VideoCore.showInteractionLabel( this.hoverInteraction.title );

		} else {

			// User is gazing
			if (this.gazeTimer < GAZE_DURATION) {
				this.gazeTimer += delta / 1000;
				var gazeV = this.gazeTimer / GAZE_DURATION;
				if (gazeV > 1) gazeV = 1;

				// Apply gaze as a color
				this.cursor.setHighlight( gazeV );

				// Interact when user gazes long enough
				if (gazeV == 1) {
					this.cursor.playConfirmation();

					// Call interaction function
					if (this.hoverInteraction.onInteract)
						this.hoverInteraction.onInteract();

				}

			}

		}
	} else {
		if (this.hoverObject) {

			// Hadle mouse out
			if (this.hoverInteraction.onMouseOut)
				this.hoverInteraction.onMouseOut();

			// Stop tracking
			if (this.hoverInteraction.trackID) {
				TrackingCore.trackEnd('interact.gaze');
			}

			// Reset properties
			this.hoverObject = null;
			this.gazeTimer = 0;
			this.cursor.setHighlight(0);

			// Hide interaction label
			VideoCore.hideInteractionLabel();

		}
	}

}

// Export
module.exports = SightInteraction;
