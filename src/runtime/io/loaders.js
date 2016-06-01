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

var JBBLoader = require('jbb/decoder');
var JBBProfileThreeLoader = require('jbb-profile-three/profile-decode');
var JBBProfileIconeezinLoader = require('jbb-profile-iconeezin/profile-decode');

/**
 * Loaders namespace contains all the different loading
 * functions.
 */
var Loaders = { };

Loaders.loadExperiment = function( bundle ) {

	// Instantiate a new bundles loader
	var sourceLoader = new JBBLoader( 'experiments' );
	sourceLoader.addProfile( JBBProfileThreeLoader );
	sourceLoader.addProfile( JBBProfileIconeezinLoader );

	// Start loading the source bundle
	console.time("source["+bundle+"]");
	sourceLoader.add( bundle );
	sourceLoader.load(function( err, db ) {
		console.timeEnd("source["+bundle+"]");
		console.log( err, db );
	});


}

/**
 * Load experiment
 */
Loaders.loadExperimentClass = function( experiment, callback ) {

	// Create a script element
	var script = document.createElement('script');
	script.addEventListener( 'load', function ( event ) {

		// Lookup class
		var classDefinition = window[experiment.className];
		if (!classDefinition) {
			callback( "The experiment does not expose class: "+experiment.className, null );
			return;
		}

		// Create class instance
		var classInst = new classDefinition();
		callback( null, classInst );

	});
	script.addEventListener( 'error', function ( event ) {
		callback( "Loading error: " + event.message, null );
	});
	script.src = experiment.url;

	// Add script to DOM
	document.body.appendChild(script);

}

// Export regitry
module.exports = Loaders;
