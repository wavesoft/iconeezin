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
 * The Experiment API namespace contains the
 * classes for implementing external experiment objects.
 */
var ExperimentAPI = {};

/**
 * Experiment source file
 */
ExperimentAPI.ExperimentFile = function( url, className ) {

	// URL to the experiment file
	this.url = url || "";

	// Class name exported in the global scope
	// after the experiment code file is loaded
	this.className = className;

	// By default the class name is <FileName> + 'Experiment'
	if (className === undefined) {
		var parts = url.split("/");

		// Strip query and hashtag
		var fname = parts[parts.length-1].split("?")[0];
		fname = fname.split("#")[0];

		// Strip .js extension
		if (fname.substr(fname.length-3).toLowerCase() == ".js") {
			fname = fname.substr(0, fname.length-3);
		}

		// Replace filename as class Name
		this.className = fname.replace( /([\._-]|^)([a-zA-Z])/g ,
			function(g,m1,m2){ return m2.toUpperCase() }) + 'Experiment';

	}

}

/**
 * Experiment base class
 */
ExperimentAPI.Experiment = function() {
	
}

// Export
module.exports = ExperimentAPI;