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

require("./custom/objects/HUD");

/**
 * HUD Status component
 */
var HUDStatus = function( viewport ) {
	THREE.HUDLayer.call(this, 256, 128, 'cc');

	// Label text
	this.viewport = viewport;
	this.labelText = "";

	// Progress
	this.progress = 0.0;
	this.progressText = "";
	this.progressOpacity = 0.0;

};

// Subclass from sprite
HUDStatus.prototype = Object.assign( Object.create( THREE.HUDLayer.prototype ), {

	constructor: HUDStatus,

	reset: function() {
		this.progress = 0.0;
		this.progressOpacity = 0.0;
		this.labelText = "";
		this.redraw();
	},

	setLabel: function( text ) {

		this.labelText = text;
		this.redraw();

	},

	setProgress: function ( value, text ) {

		this.progressText = text;

		// Fade-in
		this.viewport.runTween( 1000, (function(tweenProgress) {

			// Fade in
			this.progressOpacity = tweenProgress;
			this.redraw();

		}).bind(this), (function() {

			var v_prev = this.progress,
				v_new = value;

			// Change value
			this.viewport.runTween( 1000, (function(tweenProgress) {

				// Cross-fade value
				this.progress = v_prev + (v_new - v_prev) * tweenProgress;
				this.redraw();

			}).bind(this), (function() {

				// Delay for a while
				this.viewport.runTween( 1000, null, (function() {

					// Fade-in
					this.viewport.runTween( 1000, (function(tweenProgress) {
						this.progressOpacity = 1.0 - tweenProgress;
						this.redraw();
					}).bind(this));

				}).bind(this));

			}).bind(this));

		}).bind(this));

	},

	onPaint: function( ctx, width, height ) {

		//
		// Draw label if data exists
		//
		if (this.labelText) {

			// Background
			ctx.fillStyle = "#000000";
			ctx.globalAlpha = 0.8;
			ctx.fillRect( 2, 2, width-4, 30 );
			ctx.globalAlpha = 1.0;

			// Text
			ctx.textAlign = "center";
			ctx.font = "16px Tahoma";
			ctx.fillStyle = "#FFFFFF";
			ctx.fillText( this.labelText, width/2, 24);

		}

		//
		// Draw progress bar
		//
		if (this.progressOpacity > 0.0) {

			ctx.globalAlpha = this.progressOpacity;

			// Background
			ctx.strokeStyle = '#FFFFFF';
			ctx.lineCap = "round"
			ctx.lineWidth = 25;
			ctx.beginPath();
			ctx.moveTo( 32, height - 16 );
			ctx.lineTo( width - 32, height - 16 );
			ctx.stroke();

			// Progress bar
			var w = (width - 64) * Math.min( 1.0, this.progress );
			ctx.strokeStyle = '#0066ff';
			ctx.lineWidth = 18;
			ctx.beginPath();
			ctx.moveTo( 32, height - 16 );
			ctx.lineTo( 32 + w, height - 16 );
			ctx.stroke();

			// Text
			if (this.progressText) {
				ctx.textAlign = "center";
				ctx.font = "14px Tahoma";
				ctx.fillStyle = "#000000";
				ctx.fillText( this.progressText, width/2+1, height - 34+1);
				ctx.fillStyle = "#FFFFFF";
				ctx.fillText( this.progressText, width/2, height - 34);
			}

			ctx.globalAlpha = 1.0;

		}


	},

});

// Export label
module.exports = HUDStatus;