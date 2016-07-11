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
var HUDStatus = function() {
	THREE.HUDLayer.call(this, 256, 128, 'cc');

	// Label text
	this.labelText = "";
};

// Subclass from sprite
HUDStatus.prototype = Object.assign( Object.create( THREE.HUDLayer.prototype ), {

	constructor: HUDStatus,

	setLabel: function( text ) {

		this.labelText = text;
		this.redraw();

	},

	onPaint: function( ctx, width, height ) {

		//
		// Draw label if data exists
		//
		if (this.labelText) {

			ctx.fillStyle = "#000000";
			ctx.globalAlpha = 0.8;
			ctx.fillRect( 2, 2, width-4, 30 );
			ctx.globalAlpha = 1.0;

			ctx.textAlign = "center";
			ctx.font = "16px Tahoma";
			ctx.fillStyle = "#FFFFFF";
			ctx.fillText( this.labelText, width/2, 24);

		}

	},

});

// Export label
module.exports = HUDStatus;