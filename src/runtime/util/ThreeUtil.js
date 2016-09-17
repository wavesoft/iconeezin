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

var VideoCore = require('../core/VideoCore');

var ShadowShader = {

  fragment: [
    '#include <packing>',
    'uniform sampler2D texture;',
    'varying vec2 vUV;',
    'void main() {',
      'vec4 pixel = texture2D( texture, vUV );',
      'if ( pixel.a < 0.5 ) discard;',
      'gl_FragData[ 0 ] = packDepthToRGBA( gl_FragCoord.z );',
    '}'
  ].join('\n'),

  vertex: [
    'varying vec2 vUV;',
    'void main() {',
      'vUV = 0.75 * uv;',
      'vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );',
      'gl_Position = projectionMatrix * mvPosition;',
    '}'
  ].join('\n')

};

var ThreeUtil = {

  createTexture: function(img, props) {

    // Create texture and register a listener when it's loaded
    var tex = new THREE.Texture(img);
    img.addEventListener('load', function() {
      tex.needsUpdate = true;
    });

    // In most of the cases we want to wrap, so default to wrapping
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;

    // Add default props
    if (props) {
      Object.keys(props).forEach(function(prop) {
        tex[prop] = props[prop];
      });
    }

    return tex;
  },

  createShadowMaterial: function(forTexture) {
    return new THREE.ShaderMaterial( {
      uniforms: {
        texture:  { value: forTexture }
      },
      vertexShader: ShadowShader.vertex,
      fragmentShader: ShadowShader.fragment,
      side: THREE.DoubleSide
    });
  },

  createBildboard: function(width, height, texture, castShadow) {
    var plane = new THREE.Mesh(
        new THREE.PlaneGeometry(width, height),
        new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
          side: THREE.FrontSide
        })
      );

    // We are on a z-up world
    plane.up = new THREE.Vector3(0,0,1);

    // Cast shadow if specified
    if (castShadow) {
      plane.customDepthMaterial = ThreeUtil.createShadowMaterial(texture);
      plane.material.alphaTest = 0.1;
      plane.castShadow = true;
      plane.receiveShadow = true;
    }

    // Register a custom render listener in order
    // to make the bildboard point always towards the camera
    VideoCore.addRenderListener(function() {
      var pos = VideoCore.viewport.camera.getWorldPosition();
      pos.z = plane.position.z;
      plane.lookAt( pos );
    });

    return plane;
  },

  getAxisParameter: function(center, xUnit, yUnit, xValue, yValue) {
    var xDir = xUnit.clone().sub(center).multiplyScalar(xValue);
    var yDir = yUnit.clone().sub(center).multiplyScalar(yValue);
    return center.clone().add( xDir ).add( yDir );
  }

};

module.exports = ThreeUtil;
