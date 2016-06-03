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
var HADE = require('./HADE');
var React = require('react');

/**
 * Export Viewport
 */
module.exports = React.createClass({

	/**
	 * Default viewport state
	 */
	getInitialState: function() {
		return {
			'hade': {
				'visible': true,
				'title': 'Unknown experiment',
				'desc': 'Unknown body'
			}
		};
	},

	/**
	 * Initialize iconeezin video runtime when
	 * the viewport component is mounted.
	 */
	componentDidMount: function() {
		var dom = this.refs.canvas;
		IconeezinRuntime.Video.initialize( dom );

		// Handle messages
		IconeezinRuntime.Video.setMessageHandler((function(message) {
			if (message === null) {
				this.setState({
					'hade': {
						'visible': false
					}
				})
			} else {
				this.setState({
					'hade': {
						'visible': true,
						'title': message.title,
						'desc': message.body
					}
				})
			}
		}).bind(this));

	},

	/**
	 * Clean-up iconeezin video runtime when the vieowport
	 * is destroyed.
	 */
	componentWillUnmount: function(dom) {
		IconeezinRuntime.Video.cleanup();
		IconeezinRuntime.Video.setMessageHandler(null);
	},

	/**
	 * Update properties
	 */
	componentWillReceiveProps: function(nextProps) {

		// Apply 'hmd'
		if (this.props.hmd != nextProps.hmd) {
			IconeezinRuntime.Video.setHMD( nextProps.hmd );
		}

		// Apply 'paused'
		if (this.props.paused != nextProps.paused) {
			IconeezinRuntime.Video.setPaused( nextProps.paused );
		}

		// Apply 'experiment' change
		if (this.props.experiment != nextProps.experiment) {
			IconeezinRuntime.Experiments.display( nextProps.experiment );
		}

	},

	/**
	 * Hide HADE
	 */
	'handleHideGreeter': function() {
		this.setState({
			'hade': {
				'visible': false
			}
		});
	},

	/**
	 * Render the viewport
	 */
	render: function() {
		return (
			<div className="icnz-viewport">
				<div className="icnz-canvas" ref="canvas" />
				<HADE hmd={this.props.hmd} title={this.state.hade.title} 
					  body={this.state.hade.desc} visible={this.state.hade.visible} />
			</div>
		);
	}

});
