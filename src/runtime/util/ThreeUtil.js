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

var ThreeUtil = {

  createTexture: function(img, props) {

    // Create texture and register a listener when it's loaded
    var tex = new THREE.Texture(img);
    img.addEventListener('load', function() {
      tex.needsUpdate = true;
    });

    // In most of the cases we want to wrap, so default to wrapping
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapS = THREE.RepeatWrapping;

    // Add default props
    if (props) {
      Object.keys(props).forEach(function(prop) {
        tex[prop] = props[prop];
      });
    }

    return tex;
  }

};

module.exports = ThreeUtil;
