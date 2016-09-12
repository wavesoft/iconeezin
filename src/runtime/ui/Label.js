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

/**
 * Sprite label
 */
var Label = function( text, color, bgColor ) {

	// Create canvas
	var canvas = document.createElement('canvas');
	var textureSize = 512;
	canvas.width = textureSize;
	canvas.height = textureSize;

	// Create context
	var context = canvas.getContext('2d');
	context.textAlign = 'start';

	// Create texture
	var amap = new THREE.Texture(canvas);
	amap.minFilter = THREE.LinearFilter

	// Create sprite material
	var mat = new THREE.SpriteMaterial({
	    map: amap,
	    transparent: false,
	    color: 0xffffff
	});

	// Construct
	var scope = this;
	THREE.Sprite.call( this, mat );

	// Prepare sprite properties
	var text = text || "";
	var color = new THREE.Color( color || 0xcccccc );
	var bgColor = new THREE.Color( bgColor || 0x000000 );
	var bgOpacity = 0.8;
	var borderColor = new THREE.Color( color || 0xcccccc );
	var borderWidth = 1;
	var fontFamily = 'Tahoma';
	var fontSize = 16;
	var padding = {
		'left': 10, 'top': 10, 'right': 10, 'bottom': 10
	};

	/**
	 * Re-generate canvas
	 */
	var regenerate = function() {

		// Apply font and measure text
		context.font =  fontSize + 'px ' + fontFamily;
		var sz = context.measureText( text ),
			lineHeight = context.measureText('M').width;

		// Calculate anchor and offset
		var width = sz.width + padding.left + padding.right + borderWidth * 2,
			height = lineHeight + padding.top + padding.bottom + borderWidth * 2,
			x = (textureSize - width) / 2, y = (textureSize - height) / 2;

		// Clear rect
		context.clearRect(0, 0, textureSize, textureSize);

		// Fill back
		context.globalAlpha = bgOpacity;
		context.fillStyle = '#' + bgColor.getHexString();
		context.fillRect(x,y,width,height);
		context.globalAlpha = 1.0;

		// Fill border
		if (borderWidth > 0) {
			context.strokeStyle = '#' + borderColor.getHexString();
			context.lineWidth = borderWidth;
			context.strokeRect(x,y,width,height);
		}

		// Draw text
		context.fillStyle = '#' + color.getHexString();
		context.fillText( text, x+borderWidth+padding.left,
							    y+height/2+lineHeight/2-1 );

		// Update map
		amap.needsUpdate = true;

		// Check hide conditions
		scope.visible = !!text;

	}

	// Initial generate
	regenerate();

	/**
	 * Define properties
	 */
	Object.defineProperties(this,{

		'fontFamily': {
			'get': function() {
				return fontFamily;
			},
			'set': function( val ) {
				fontFamily = val;
				regenerate();
			}
		},

		'fontSize': {
			'get': function() {
				return fontSize;
			},
			'set': function( val ) {
				fontSize = val;
				regenerate();
			}
		},

		'color': {
			'get': function() {
				return color;
			},
			'set': function( val ) {
				color.set( val );
				regenerate();
			}
		},

		'backgroundColor': {
			'get': function() {
				return bgColor;
			},
			'set': function( val ) {
				bgColor.set( val );
				regenerate();
			}
		},

		'backgroundOpacity': {
			'get': function() {
				return bgOpacity;
			},
			'set': function( val ) {
				bgOpacity = val;
				regenerate();
			}
		},

		'borderColor': {
			'get': function() {
				return borderColor;
			},
			'set': function( val ) {
				borderColor.set( val );
				regenerate();
			}
		},

		'borderWidth': {
			'get': function() {
				return borderWidth;
			},
			'set': function( val ) {
				borderWidth = val;
				regenerate();
			}
		},

		'text': {
			'get': function() {
				return text;
			},
			'set': function( val ) {
				text = val;
				regenerate();
			}
		},

		'padding': {
			'get': function() {
				return padding;
			},
			'set': function( val ) {
				if (typeof val === 'object') {
					padding.left = val.left || padding.left;
					padding.right = val.right || padding.right;
					padding.top = val.top || padding.top;
					padding.bottom = val.bottom || padding.bottom;
					regenerate();

				} else if (typeof val === 'number') {
					padding.left = val;
					padding.right = val;
					padding.top = val;
					padding.bottom = val;
					regenerate();

				}
			}
		}

	});

};

// Subclass from sprite
Label.prototype = Object.create( THREE.Sprite.prototype );

// Export label
module.exports = Label;
