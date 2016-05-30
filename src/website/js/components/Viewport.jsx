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

var IconeezinRuntime = require("iconeezin/runtime");
var React = require('react');

/**
 * Export Viewport
 */
module.exports = React.createClass({

	/**
	 * Initialize iconeezin video runtime when
	 * the viewport component is mounted.
	 */
	componentDidMount: function() {
		var dom = this.refs.viewport;
		IconeezinRuntime.Video.initialize( dom );
	},

	/**
	 * Clean-up iconeezin video runtime when the vieowport
	 * is destroyed.
	 */
	componentWillUnmount: function(dom) {
		IconeezinRuntime.Video.cleanup();
	},

	/**
	 * Forward updates to iconeezin runtime
	 */
	shouldComponentUpdate: function(nextProps, nextState) {

		// Apply 'hmd'
		if (this.props.hmd != nextProps.hmd) {
			IconeezinRuntime.Video.setHMD( nextProps.hmd );
		}

		// Apply 'paused'
		if (this.props.paused != nextProps.paused) {
			IconeezinRuntime.Video.setPaused( nextProps.paused );
		}

		// DOM Never invalidates
		return false;

	},

	/**
	 * Render the viewport
	 */
	render: function() {
		return (
			<div ref="viewport" className="icnz-viewport" />
		);
	}

});
