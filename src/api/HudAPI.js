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
 * A HUD layer contains drawable and addressable information
 */
var HUDLayer = function ( width, height, anchor ) {

  // Link information
  this.id = null;
  this.hud = null;
  this.pixelRatio = 1.0;

  // Local properties
  this.anchor = anchor || 'tl';
  this.size = new THREE.Vector2( width, height );
  this.position = new THREE.Vector2( 0, 0 );

  this.uniforms = {
    'size': new THREE.Vector2(0,0),
    'pos': new THREE.Vector2(0,0),
    'tex': null
  };

  // Create a 2D canvas
  this.canvas = document.createElement('canvas');
  this.context = this.canvas.getContext('2d');
  this.setSize( width, height );

  // Create texture using the canvas
  this.uniforms.tex = new THREE.Texture( this.canvas );
  this.uniforms.tex.needsUpdate = true;

}

HUDLayer.prototype = {
  constructor: HUDLayer,

  register: function( hud, layer_id ) {

    // Update uniforms
    this.id = layer_id;
    this.hud = hud;
    this.hud.uniforms['layer_size'].value[this.id] = this.uniforms.size;
    this.hud.uniforms['layer_pos'].value[this.id] = this.uniforms.pos;
    this.hud.uniforms['layer_tex'].value[this.id] = this.uniforms.tex;

    // Adapt pixel ratio from HUD
    this.setPixelRatio( this.hud.pixelRatio );

    // Update uniforms
    this.updateUniforms();
    this.redraw();

  },

  unregister: function() {

    // Unregister
    this.hud.uniforms['layer_size'].value[this.id] = new THREE.Vector2(0,0);
    this.hud.uniforms['layer_pos'].value[this.id] = new THREE.Vector2(0,0);
    this.hud.uniforms['layer_tex'].value[this.id] = null;
    this.id = null;
    this.hud = null;

  },

  setPosition: function( x, y ) {

    // Set position & Update uniforms
    this.position.set( x, y );
    this.updateUniforms();

  },

  setAnchor: function( anchor ) {

    // Set anchor & Update uniforms
    this.anchor = anchor;
    this.updateUniforms();

  },

  setPixelRatio: function( ratio ) {

    // Set anchor & Update uniforms
    this.pixelRatio = ratio;
    this.setSize( this.size.x, this.size.y );

  },

  setSize: function( width, height ) {

    // Snap canvas to multiplicants of power of 2
    this.canvas.width = Math.pow(2, Math.ceil(Math.log2(width))) * this.pixelRatio;
    this.canvas.height = Math.pow(2, Math.ceil(Math.log2(height))) * this.pixelRatio;
    this.canvas.style = "width: "+width+"px; height: "+height+" px;";

    // Keep real size available
    this.size.set( width, height );

    // Update uniforms
    this.updateUniforms();
    this.redraw();

  },

  updateUniforms: function() {

    // Skip if disposed or not registered
    if (!this.canvas) return;
    if (!this.hud) return;

    //
    // Update size
    //
    this.uniforms.size.set( this.canvas.width, this.canvas.height );

    //
    // Depending on anchor alignment, update position uniform
    //
    switch (this.anchor[0].toLowerCase()) {
      case 't':
        this.uniforms.pos.y = (this.hud.size.y - this.canvas.height) - this.position.y;
        break;
      case 'c':
        this.uniforms.pos.y = (this.hud.size.y - this.size.y) / 2 - (this.canvas.height - this.size.y) - this.position.y;
        break;
      case 'b':
        this.uniforms.pos.y = (this.size.y - this.canvas.height) + this.position.y;
        break;
      default:
        console.warn("THREE.HUD: unknown anchor argument '"+this.anchor[0]+"'. Expecting 't','c','b'.")
        break;
    }
    switch (this.anchor[1].toLowerCase()) {
      case 'l':
        this.uniforms.pos.x = this.position.x;
        break;
      case 'c':
        this.uniforms.pos.x = this.hud.size.x/2 - this.size.x/2 + this.position.x;
        break;
      case 'r':
        this.uniforms.pos.x = (this.hud.size.x - this.size.x) + this.position.x;
        break;
      default:
        console.warn("THREE.HUD: unknown anchor argument '"+this.anchor[1]+"'. Expecting 'l','c','r'.")
        break;
    }

    //
    // Round position
    //
    this.uniforms.pos.set(
      Math.round(this.uniforms.pos.x),
      Math.round(this.uniforms.pos.y)
    );

    // console.log("HUD Layer",this.id,"at (",this.uniforms.pos.x,",",this.uniforms.pos.y,") size=(",
    //  this.uniforms.size.x,",",this.uniforms.size.y,") with HUD=(",this.hud.size.x,",",this.hud.size.y,")");

  },

  redraw: function() {

    // Skip if disposed or not registered
    if (!this.canvas) return;
    if (!this.hud) return;

    // Call user's paint method to draw the canvas
    this.context.clearRect( -1, -1, this.canvas.width+2, this.canvas.height+2 );
    this.context.save();
    this.context.translate(0.5,0.5);
    this.onPaint( this.context, this.size.x, this.size.y );
    this.context.restore();

    // Update texture
    this.uniforms.tex.needsUpdate = true;

  },

  dispose: function() {

    // Unregister from HUD
    this.unregister();

    // Release resources
    this.context = null;
    this.canvas = null;

  },

  onPaint: function( ctx, width, height ) {

    // Must be implemented by the user to draw the layer contents

  },

};

module.exports = {
  HUDLayer: HUDLayer
}
