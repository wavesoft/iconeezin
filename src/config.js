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
 * Expose global configuration
 */
module.exports = {

	/**
	 * Global 'up' direction
	 */
	'up': null,

	/**
	 * Path configuration
	 */
	'path': {

		/**
		 * Path to experiments base directory
		 */
		'experiments': 'experiments',

		/**
		 * Path to experiments metadata
		 */
		'metadata': 'experiments/meta.json'

	},

	/**
	 * Tracking configuration
	 */
	'track': {

		/**
		 * Tracking ID for this session
		 */
		'id': '',

		/**
		 * Tracking provider configuration
		 */
		'provider': {

			/**
			 * We are using our custom real-time tracking,
			 * but this can easily be replaced with google analytics
			 */
			'className': 'RealTimeTracker',

			/**
			 * Path to real-time tracker URL
			 */
			'url': 'tracker/api.php'

		}


	}

};