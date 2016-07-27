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

var THREE = require('three');
var ExperimentsAPI = require("../../api/Experiments");
var InteractionCore = require("../core/InteractionCore");

var Label = require('./Label');

/**
 * Paint function for block
 */
function PAINT_BLOCK( title, subtitle, progress, icon ) {
	return function(ctx, w, h, mat) {

		// Background
		ctx.fillStyle = '#000000';
		ctx.globalAlpha = 0.7;
		ctx.fillRect(5,5,w-10,h-10);
		ctx.globalAlpha = 1.0;

		// Border
		ctx.strokeStyle = '#FFFFFF';
		ctx.lineWidth = 3;
		ctx.strokeRect(1,1,w-2,h-2);

		// Title
		ctx.fillStyle = '#FFFFFF';
		ctx.textAlign = "center";
		ctx.font = "26px Tahoma";
		ctx.fillText(title, w/2, 34);

		// Subtitle
		ctx.fillStyle = '#00FF00';
		ctx.textAlign = "end";
		ctx.font = "19px Tahoma";
		ctx.fillText(subtitle + ' ' + Math.round(progress*100) + '%', 245, 72);

		// Progress bars
		for (var i=0, x=97; i<10; i++, x+=15) {
			if (i/10 < progress) {
				ctx.fillStyle = '#00FF00';
			} else {
				ctx.fillStyle = '#FFFFFF';
			}
			ctx.fillRect(x,82,12,27);
		}

		// Circle
		ctx.fillStyle = '#000000';
		ctx.lineWidth = 3;
		ctx.beginPath();
		ctx.arc( 46, 82, 30, 0, Math.PI*2 );
		ctx.fill();

		if (icon == 0) { // Play

			ctx.strokeStyle = '#FFFFFF';
			ctx.stroke();

			ctx.fillStyle = '#FFFFFF';
			ctx.beginPath();
			ctx.moveTo(41,69);
			ctx.lineTo(55,81);
			ctx.lineTo(41,95);
			ctx.fill();

		} else if (icon == 1) { // V

			ctx.strokeStyle = '#009245';
			ctx.stroke();

			ctx.strokeStyle = '#39B54A';
			ctx.lineWidth = 5;
			ctx.beginPath();
			ctx.moveTo(31,84);
			ctx.lineTo(40,93);
			ctx.lineTo(61,73);
			ctx.stroke();

		} else if (icon == 2) { // X

			ctx.strokeStyle = '#C1272D';
			ctx.stroke();

			ctx.strokeStyle = '#ED1C24';
			ctx.lineWidth = 5;
			ctx.beginPath();
			ctx.moveTo(34,68);
			ctx.lineTo(58,93);
			ctx.moveTo(34,93);
			ctx.lineTo(58,68);
			ctx.stroke();

		} else if (typeof icon === 'string') {

			var img = document.createElement('img');
			img.onload = function() {


			};
			img.src = icon;

		}


	};
}

/**
 * Results GUI were experiment results are shown
 */
var ResultsRoom = function() {
	ExperimentsAPI.Experiment.call( this );
	this.anchor.position.set( 0, 0, 0 );

	// Create a sphere for equirectangular VR
	var geom = new THREE.SphereGeometry( 500, 60, 40 );
	var mat = new THREE.MeshBasicMaterial({ color: 0xffffff });
	geom.scale( -1, 1, 1 );

	// Create a spinner sprite
	var loader = new THREE.TextureLoader();
	loader.load( require('../../img/results.jpg'), (function( texture ) {

		// Set material map
		mat.map = texture;
		texture.needsUpdate = true;

	}).bind(this));

	// Create the sphere mesh
	var mesh = new THREE.Mesh( geom, mat );
	mesh.rotation.x = Math.PI/2;
	this.add( mesh );

	// Local properties
	this.buttons = [];

	// Title label
	this.lblTitle = new Label( "test" );
	this.lblTitle.position.y = 8;
	// this.pivotTitle = new THREE.Object3D();
	// this.pivotTitle.add( this.lblTitle );

	this.lblTitle.fontSize = 18;
	this.lblTitle.text = "Results Screen";
	// this.add(this.pivotTitle);

	// Add a few buttons
	this.addButton( PAINT_BLOCK("EXPERIMENT 1", "Score", Math.random(), 0) );
	this.addButton( PAINT_BLOCK("EXPERIMENT 2", "Score", Math.random(), 1) );
	this.addButton( PAINT_BLOCK("EXPERIMENT 3", "Score", Math.random(), 2) );
	this.addButton( PAINT_BLOCK("EXPERIMENT 4", "Score", Math.random(), 0) );
	this.addButton( PAINT_BLOCK("EXPERIMENT 5", "Score", Math.random(), 1) );
	this.addButton( PAINT_BLOCK("EXPERIMENT 6", "Score", Math.random(), 2) );
	this.addButton( PAINT_BLOCK("EXPERIMENT 7", "Score", Math.random(), 0) );
	this.addButton( PAINT_BLOCK("EXPERIMENT 8", "Score", Math.random(), 1) );
	this.addButton( PAINT_BLOCK("EXPERIMENT 9", "Score", Math.random(), 2) );
	this.addButton( PAINT_BLOCK("EXPERIMENT 10", "Score", Math.random(), 0) );
	this.addButton( PAINT_BLOCK("EXPERIMENT 11", "Score", Math.random(), 1) );
	this.addButton( PAINT_BLOCK("EXPERIMENT 12", "Score", Math.random(), 2) );

};

/**
 * Results room constructor
 */
ResultsRoom.prototype = Object.assign( Object.create( ExperimentsAPI.Experiment.prototype ), {

	constructor: ResultsRoom,

	/**
	 * Reset results room
	 */
	reset: function() {
		this.buttons = [];

	},

	configure: function( meta ) {

	},

	/**
	 * Re-align results button
	 */
	realign: function(sx,sy) {
		var center = new THREE.Vector3(0,0,0);

		// Break down to cols and rows
		var cols = 4;
		var rows = Math.ceil( this.buttons.length / cols );
		if (this.buttons.length < cols) cols = this.buttons.length;

		// Radial distribution parameters
		// var space_x = 0.349066;
		// var space_y = 0.2556194;
		var space_x = sx || 0.60;
		var space_y = 3.2; //sy || 0.35;

		// Distribute
		var ofs_x = ((cols-1) * space_x) / 2.0;
		var rx = ofs_x, ry = ((rows-1) * space_y) / 2.0;
		for (var i=0, j=0, l=this.buttons.length; i<l; ++i) {
			var pvt = this.buttons[i][0],
				btn = this.buttons[i][1],
				ibn = this.buttons[i][2];

			// Orient object
			pvt.rotation.order = 'ZXY';
			pvt.position.z = 0;
			pvt.rotation.z = rx;
			// pvt.rotation.x = ry;
			btn.lookAt( center );
			ibn.lookAt( center );
			pvt.position.z = ry;

			// Keep original position for tweening
			btn.original_position = btn.position.clone();

			// Check for row overflow
			rx -= space_x;
			if (++j >= cols) {
				rx = ofs_x;
				ry -= space_y;
				j = 0;
			}

		}

		// Place label on top
		// this.pivotTitle.rotation.x = ry + 0.1;

	},

	/**
	 * Add a button to the screen 
	 */
	addButton: function( cb_paint, cb_click ) {

		// Prepare mesh
		var geometry = new THREE.PlaneGeometry( 6, 3 );
		var material = new THREE.MeshBasicMaterial( {color: 0xffffff, side: THREE.DoubleSide, transparent: true} );
		var plane = new THREE.Mesh( geometry, material );

		// Draw the graphic
		var canvas = document.createElement('canvas');
		canvas.width = 256;
		canvas.height = 128;
		var ctx = canvas.getContext('2d');
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		if (cb_paint) cb_paint( ctx, canvas.width, canvas.height, material );

		// Create texture
		var texture = new THREE.Texture(canvas);
		texture.needsUpdate = true;
		material.map = texture;

		// Create a transparent interaction plane
		// that does not participate in the animation
		var transparentMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
		transparentMaterial.visible = false;
		var iplane = new THREE.Mesh( geometry, transparentMaterial );
		iplane.position.y = 10;

		// Create pivot object
		var pivot = new THREE.Object3D();
		plane.position.y = 10;
		plane.isHover = false;
		pivot.add( plane );
		pivot.add( iplane );

		// Register on buttons
		this.add( pivot );

		// Re-align
		this.buttons.push([ pivot, plane, iplane ]);
		this.realign();

		// Make interactive
		InteractionCore.makeInteractive( iplane, {
			'gaze': false,
			'debounce': 150,
			'onClick': function() {
				if (cb_click) cb_click();
			},
			'onMouseOver': function() {
				plane.isHover = true;
			},
			'onMouseOut': function() {
				plane.isHover = false;
			}
		});

	},

	/**
	 * Render update
	 */
	onUpdate: function( delta ) {
		var center = new THREE.Vector3(0,0,0);
		for (var i=0, l=this.buttons.length; i<l; ++i) {
			var pvt = this.buttons[i][0], 
				btn = this.buttons[i][1], target = null;

			// 
			if (btn.isHover) {
				target = btn.original_position.clone().multiplyScalar(4/5);
				target.z = -pvt.position.z * 1/3;
			} else {
				target = btn.original_position;
			}

			// 
			if (target && !btn.position.equals(target)) {
				btn.position.add( target.clone().sub( btn.position ).divideScalar(10) );
				if (btn.position.distanceTo( target ) < 0.1)
					btn.position.copy( target );
			}

		}
	},

});

module.exports = ResultsRoom;

