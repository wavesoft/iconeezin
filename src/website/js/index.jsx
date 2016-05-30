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
var ReactDOM = require('react-dom');

var Viewport = require('./components/Viewport');

/**
 * Root component
 */
var Iconeez = React.createClass({

	getInitialState: function() {
		return {
			'running': false,
			'hmd': false,
		};
	},

	handleStart: function(hmd) {
		this.setState({ 'running': true, 'hmd': hmd });
	},

	handlePause: function() {
		this.setState({ 'running': false });
	},

	render: function() {
		return (
			  <Viewport onStart={this.handleStart} onPause={this.handlePause} />
		);
	}

});

/**
 * Render root component
 */
ReactDOM.render(
	<Iconeez />,
	document.body
);
