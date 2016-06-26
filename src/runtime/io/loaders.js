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

var Config = require("../../config");

var JBBLoader = require('jbb/decoder');
var JBBProfileThreeLoader = require('jbb-profile-three/profile-decode');
var JBBProfileIconeezinLoader = require('jbb-profile-iconeezin/profile-decode');

/**
 * Loaders namespace contains all the different loading
 * functions.
 */
var Loaders = { };

/**
 * Initialize loaders
 */
Loaders.initialize = function() {

	// Database singleton
	this.database = {};

	// Create jbb singleton to the shared database in order
	// to shared graphics and other shared resources
	this.jbbLoader = new JBBLoader( Config.experiments_dir, this.database );

	// Add jbb profiles 
	this.jbbLoader.addProfile( JBBProfileThreeLoader );
	this.jbbLoader.addProfile( JBBProfileIconeezinLoader );

}

/**
 * Load experiment bundle and then get a reference to the
 * experiment class.
 */
Loaders.loadExperiment = function( bundle, callback, progress ) {

	// Show loading screen
	progress(0);

	// Start loading the source bundle
	console.time("bundle["+bundle+"]");
	this.jbbLoader.add( bundle + ".jbb" );
	this.jbbLoader.addProgressHandler(progress);
	this.jbbLoader.load(function( err, db ) {
		console.timeEnd("bundle["+bundle+"]");
		progress(1);

		// Handle errors
		if (err) {
			callback( err );
			return;
		}

		// We have the bundle loaded, now load experiment's main class
		var experiment = Loaders.loadExperimentClass( 
			db[ bundle +'/main' ], 
			function( err, experimentClass ) {

				// Callback error first
				if (err) {
					callback( err, null );
					return;
				}

				// Instantiate experiment and pass it
				// the bundle database
				var experiment = new experimentClass( db );

				// Callback with bundle and experiment
				callback( null, experiment );

			}
		);

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
		var classDefinition = Iconeezin.Experiments[experiment.className];
		if (classDefinition === undefined) {
			callback( "The experiment does not expose class: "+experiment.className, null );
			return;
		}

		// Create class instance
		callback( null, classDefinition );

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
