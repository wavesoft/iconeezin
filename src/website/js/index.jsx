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

var React = require('react');
var ReactDOM = require('react-dom');
var IconeezinRuntime = require("iconeezin/runtime");

var Viewport = require('./components/Viewport');

/**
 * initialize runtime components that do not require
 * a DOM component.
 */
IconeezinRuntime.Audio.initialize();

/**
 * Root component
 */
var IconeezinRoot = React.createClass({

	/**
	 * Default state
	 */
	getInitialState: function() {
		return {
			'paused': true,
			'hmd': false,
		};
	},

	/**
	 * On mount, listen for full screen events.
	 */
	componentDidMount: function() {

		// Register full screen handler
		document.addEventListener("fullscreenchange", this.handleFullScreen);
		document.addEventListener("webkitfullscreenchange", this.handleFullScreen);
		document.addEventListener("mozfullscreenchange", this.handleFullScreen);
		document.addEventListener("MSFullscreenChange", this.handleFullScreen);

	},

	/**
	 * On unmount, remove full screen event listener.
	 */
	componentWillUnmount: function() {

		// Register full screen handler
		document.removeEventListener("fullscreenchange", this.handleFullScreen);
		document.removeEventListener("webkitfullscreenchange", this.handleFullScreen);
		document.removeEventListener("mozfullscreenchange", this.handleFullScreen);
		document.removeEventListener("MSFullscreenChange", this.handleFullScreen);

	},

	/**
	 * Handle updates to the state
	 */
	componentDidUpdate: function(prevProps, prevState) {
		if (prevState.paused != this.state.paused) {
			if (!this.state.paused) {

				// Enable full-screen when switching state
				var vpDOM = this.refs.content;
				if (vpDOM.requestFullscreen) {
					vpDOM.requestFullscreen();
				} else if (vpDOM.webkitRequestFullscreen) {
					vpDOM.webkitRequestFullscreen();
				} else if (vpDOM.mozRequestFullScreen) {
					vpDOM.mozRequestFullScreen();
				} else if (vpDOM.msRequestFullscreen) {
					vpDOM.msRequestFullscreen();
				}

			}
		}
	},

	/**
	 * Start/Stop
	 */
	handleStart: function(hmd) {
		alert('handling!');
		this.setState({ 'paused': false, 'hmd': hmd });
	},
	handlePause: function() {
		this.setState({ 'paused': true });
	},
	handleFullScreen: function(e) {
		if (
			document.fullscreenElement ||
			document.webkitFullscreenElement ||
			document.mozFullScreenElement ||
			document.msFullscreenElement
		) {
			// We are full screen
		} else {
			// We are not full screen
			this.handlePause();
		}
	},

	/**
	 * Main render function
	 */
	render: function() {
		return (
			<div ref="content" className="icnz-content">
			  <Viewport paused={this.state.paused} hmd={this.state.hmd} />
			  <button onClick={this.handleStart}>Start</button>
			</div>
		);
	}

});

/**
 * Render root component
 */
ReactDOM.render(
	<IconeezinRoot />,
	document.getElementById('app')
);
