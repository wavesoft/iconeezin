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
 * Browser function normalization
 */
var Browser = {};

//////////////////////////////////////////////////////////////////////////////////////////
// Feature detection API
//////////////////////////////////////////////////////////////////////////////////////////

/**
 * Test for mobile/tablet
 */
Browser.isMobileOrTablet = function() {
  var check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};

/**
 * Test for mobile only
 */
Browser.isMobile = function() {
  var check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};

//////////////////////////////////////////////////////////////////////////////////////////
// Full-Screen API
//////////////////////////////////////////////////////////////////////////////////////////

/**
 * HTML5 Fully-compliant API
 */
if (document.body.requestFullscreen) {

	Browser.requestFullscreen = function( elm, opt ) { return elm.requestFullscreen(opt); }
	Browser.exitFullscreen = function() { return document.exitFullscreen(); }
	Browser.getFullscreenElement = function() { return document.fullscreenElement }

	Browser.onFullscreenChange = function( cb ) { return document.addEventListener( 'fullscreenchange', cb, false); }
	Browser.offFullscreenChange = function( cb ) { return document.removeEventListener( 'fullscreenchange', cb); }

/**
 * Mozila-Prefixed HTML5 API
 */
} else if (document.body.mozRequestFullScreen) {

	Browser.requestFullscreen = function( elm, opt ) { return elm.mozRequestFullScreen(opt); }
	Browser.exitFullscreen = function() { return document.mozCancelFullScreen(); }
	Browser.getFullscreenElement = function() { return document.mozFullScreenElement }

	Browser.onFullscreenChange = function( cb ) { return document.addEventListener( 'mozfullscreenchange', cb, false); }
	Browser.offFullscreenChange = function( cb ) { return document.removeEventListener( 'mozfullscreenchange', cb); }

/**
 * Webkit-Prefixed HTML5 API
 */
} else if (document.body.webkitRequestFullscreen) {

	Browser.requestFullscreen = function( elm, opt ) { elm.webkitRequestFullscreen(opt); }
	Browser.exitFullscreen = function() { return document.webkitExitFullscreen(); }
	Browser.getFullscreenElement = function() { return document.webkitFullscreenElement }

	Browser.onFullscreenChange = function( cb ) { return document.addEventListener( 'webkitfullscreenchange', cb, false); }
	Browser.offFullscreenChange = function( cb ) { return document.removeEventListener( 'webkitfullscreenchange', cb); }

}

/**
 * Helper functions
 */
Browser.isFullscreen = function() { return !!Browser.getFullscreenElement(); }

//////////////////////////////////////////////////////////////////////////////////////////
// WebVR API
//////////////////////////////////////////////////////////////////////////////////////////

const VR_UNSUPPORTED = 0;
const VR_DEPRECATED = 1;
const VR_LATEST = 2;

/**
 * Usable VR Display
 */
Browser.vrHMD = undefined;
Browser.vrAPIVersion = VR_UNSUPPORTED;
Browser.vrPresenting = false;

/**
 * Private VR Properties
 */
var onVRSupportChange_Callbacks = [];
var onVRDisplayPresentChange_Callbacks = [];
var vrBugfixAttempt = false;

/**
 * VR Support change listeners
 */
Browser.onVRSupportChange = function( cb ) {
	onVRSupportChange_Callbacks.push(cb);
	if (Browser.vrHMD) {
		cb( true, Browser.vrHMD );
	}
}
Browser.offVRSupportChange = function( cb ) {
	var i = onVRSupportChange_Callbacks.indexOf(cb);
	if (i>=0) onVRSupportChange_Callbacks.splice(i,1);
}

/**
 * VR Present change listeners
 */
Browser.onVRDisplayPresentChange = function( cb ) {
	onVRDisplayPresentChange_Callbacks.push(cb);
}
Browser.offVRSupportChange = function( cb ) {
	var i = onVRDisplayPresentChange_Callbacks.indexOf(cb);
	if (i>=0) onVRDisplayPresentChange_Callbacks.splice(i,1);
}
var vrDisplayPresentChangeHandler = function() {

	// Check if we are presenting
	if (Browser.vrHMD.isPresenting) {

		// Get render size
		var eyeParamsL = Browser.vrHMD.getEyeParameters( 'left' );
		var eyeWidth, eyeHeight;

		// We are presenting
		Browser.vrPresenting = true;

		// Check according to old/new API
		if (Browser.vrAPIVersion === VR_LATEST) {
			eyeWidth = eyeParamsL.renderWidth;
			eyeHeight = eyeParamsL.renderHeight;

		} else if (Browser.vrAPIVersion === VR_DEPRECATED) {
			eyeWidth = eyeParamsL.renderRect.width;
			eyeHeight = eyeParamsL.renderRect.height;

		}

		// Callback with enabled VR + custom render size
		for (var i=0, l=onVRDisplayPresentChange_Callbacks.length; i<l; ++i)
			onVRDisplayPresentChange_Callbacks[i]( true, eyeWidth*2, eyeHeight, 1 );

	} else {

		// We are not presenting
		Browser.vrPresenting = false;

		// Callback with disabled VR
		for (var i=0, l=onVRDisplayPresentChange_Callbacks.length; i<l; ++i)
			onVRDisplayPresentChange_Callbacks[i]( false, 0, 0, 0 );

	}

}
var vrOldAPIPresentChangeHandler = function() {

	// Skip if this full-screen event does not originate from a VR event
	if (!Browser.vrHMD || ((Browser.vrAPIVersion == VR_LATEST) && !vrBugfixAttempt)) return;

	// Get fullscreen element
	var elm = Browser.getFullscreenElement();

	// Trigger accordingly
	if (elm || vrBugfixAttempt) {

		// We are presenting
		Browser.vrPresenting = true;

		// Callback with enabled VR
		for (var i=0, l=onVRDisplayPresentChange_Callbacks.length; i<l; ++i)
			onVRDisplayPresentChange_Callbacks[i]( true,
				window.screen.width, window.screen.height, window.devicePixelRatio );

	} else {

		// We are not presenting
		Browser.vrPresenting = true;

		// Callback with disabled VR
		for (var i=0, l=onVRDisplayPresentChange_Callbacks.length; i<l; ++i)
			onVRDisplayPresentChange_Callbacks[i]( false, 0, 0, 0 );

	}

	// Reset bugfix flag
	vrBugfixAttempt = false;

}

/**
 * Bind VR change listeners
 */
window.addEventListener('vrdisplayconnected', Browser.detectVR, false );
window.addEventListener('vrdisplaydisconnected', Browser.detectVR, false );
window.addEventListener('vrdisplaypresentchange', vrDisplayPresentChangeHandler, false );
Browser.onFullscreenChange( vrOldAPIPresentChangeHandler );

/**
 * Test if browser has VR support
 */
Browser.hasVR = function() {
	return (navigator.getVRDisplays !== undefined || navigator.getVRDevices !== undefined);
};

/**
 * Test if browser has VR support
 */
Browser.hasVRDisplay = function() {
	return !!Browser.vrHMD;
}

/**
 * Detect and initialize VR objects
 */
Browser.detectVR = function( callback ) {

	function gotVRDevices( devices ) {

		var hasPrevDevice = false;
		var pickDevice = undefined;

		for ( var i = 0; i < devices.length; i ++ ) {

			// Check if previous device is still present
			// (when called via 'vrdisplaydisconnected')
			if (Browser.vrHMD && Browser.vrHMD === devices[i]) {
				hasPrevDevice = true;
				break;
			}

			// Pick first available device
			if ( 'VRDisplay' in window && devices[ i ] instanceof VRDisplay ) {
				if (!pickDevice) pickDevice = devices[ i ];

			} else if ( 'HMDVRDevice' in window && devices[ i ] instanceof HMDVRDevice ) {
				if (!pickDevice) pickDevice = devices[ i ];

			}

		}

		if (hasPrevDevice) {
			// Nothing changed
		} else {

			// First trigger 'unplugged' on the previous device
			if (Browser.vrHMD) {
				for (var i=0, l=onVRSupportChange_Callbacks.length; i<l; ++i) {
					onVRSupportChange_Callbacks[i]( false, Browser.vrHMD );
				}
			}

			// Then trigger 'plugged' on the new device
			Browser.vrHMD = pickDevice;
			if (pickDevice) {
				for (var i=0, l=onVRSupportChange_Callbacks.length; i<l; ++i) {
					onVRSupportChange_Callbacks[i]( true, Browser.vrHMD );
				}
			}

		}

	}

	if ( navigator.getVRDisplays ) {

		// Latest API
		Browser.vrAPIVersion = VR_LATEST;
		navigator.getVRDisplays().then( gotVRDevices );

	} else if ( navigator.getVRDevices ) {

		// Deprecated API
		Browser.vrAPIVersion = VR_DEPRECATED;
		navigator.getVRDevices().then( gotVRDevices );

	}

};

Browser.requestHMDPresent = function( canvas, callback ) {
	if (!Browser.vrHMD) return;

	return new Promise( function ( resolve, reject ) {

		// Skip if already presenting
		if (Browser.vrPresenting) {
			resolve();
			return;
		}

		// Handle request according to API version
		if (Browser.vrAPIVersion == VR_LATEST) {
			Browser.vrHMD.requestPresent( [ { source: canvas } ] ).then(function() {

				// BOG: Browser did not grab the vr HMD device
				if (!Browser.vrHMD.isPresenting) {
					vrBugfixAttempt = true;
					Browser.requestFullscreen( canvas );
				}

				resolve();
			});

		} else if (Browser.vrAPIVersion == VR_DEPRECATED) {
			Browser.requestFullscreen( canvas, { vrDisplay: Browser.vrHMD } );
			resolve();

		}

	});

};

Browser.exitHMDPresent = function( callback ) {
	if (!Browser.vrHMD) return;

	return new Promise( function ( resolve, reject ) {

		// Skip if already not presenting
		if (!Browser.vrPresenting) {
			resolve();
			return;
		}

		// Handle request according to API version
		if (Browser.vrAPIVersion == VR_LATEST) {
			resolve( Browser.vrHMD.exitPresent() );

		} else if (Browser.vrAPIVersion == VR_DEPRECATED) {
			Browser.exitPresent();

		}

	});

};

// Export Browser
module.exports = Browser;
