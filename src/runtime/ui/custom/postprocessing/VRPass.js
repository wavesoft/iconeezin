/**
 * @author dmarcos / https://github.com/dmarcos
 * @author mrdoob / http://mrdoob.com
 *
 * WebVR Spec: http://mozvr.github.io/webvr-spec/webvr.html
 *
 * Firefox: http://mozvr.com/downloads/
 * Chromium: https://drive.google.com/folderview?id=0BzudLt22BqGRbW9WTHMtOWMzNjQ&usp=sharing#list
 *
 */

function fovToProjection( fov, rightHanded, zNear, zFar ) {

	var DEG2RAD = Math.PI / 180.0;

	var fovPort = {
		upTan: Math.tan( fov.upDegrees * DEG2RAD ),
		downTan: Math.tan( fov.downDegrees * DEG2RAD ),
		leftTan: Math.tan( fov.leftDegrees * DEG2RAD ),
		rightTan: Math.tan( fov.rightDegrees * DEG2RAD )
	};

	return fovPortToProjection( fovPort, rightHanded, zNear, zFar );

}

function fovToNDCScaleOffset( fov ) {

	var pxscale = 2.0 / ( fov.leftTan + fov.rightTan );
	var pxoffset = ( fov.leftTan - fov.rightTan ) * pxscale * 0.5;
	var pyscale = 2.0 / ( fov.upTan + fov.downTan );
	var pyoffset = ( fov.upTan - fov.downTan ) * pyscale * 0.5;
	return { scale: [ pxscale, pyscale ], offset: [ pxoffset, pyoffset ] };

}

function fovPortToProjection( fov, rightHanded, zNear, zFar ) {

	rightHanded = rightHanded === undefined ? true : rightHanded;
	zNear = zNear === undefined ? 0.01 : zNear;
	zFar = zFar === undefined ? 10000.0 : zFar;

	var handednessScale = rightHanded ? - 1.0 : 1.0;

	// start with an identity matrix
	var mobj = new THREE.Matrix4();
	var m = mobj.elements;

	// and with scale/offset info for normalized device coords
	var scaleAndOffset = fovToNDCScaleOffset( fov );

	// X result, map clip edges to [-w,+w]
	m[ 0 * 4 + 0 ] = scaleAndOffset.scale[ 0 ];
	m[ 0 * 4 + 1 ] = 0.0;
	m[ 0 * 4 + 2 ] = scaleAndOffset.offset[ 0 ] * handednessScale;
	m[ 0 * 4 + 3 ] = 0.0;

	// Y result, map clip edges to [-w,+w]
	// Y offset is negated because this proj matrix transforms from world coords with Y=up,
	// but the NDC scaling has Y=down (thanks D3D?)
	m[ 1 * 4 + 0 ] = 0.0;
	m[ 1 * 4 + 1 ] = scaleAndOffset.scale[ 1 ];
	m[ 1 * 4 + 2 ] = - scaleAndOffset.offset[ 1 ] * handednessScale;
	m[ 1 * 4 + 3 ] = 0.0;

	// Z result (up to the app)
	m[ 2 * 4 + 0 ] = 0.0;
	m[ 2 * 4 + 1 ] = 0.0;
	m[ 2 * 4 + 2 ] = zFar / ( zNear - zFar ) * - handednessScale;
	m[ 2 * 4 + 3 ] = ( zFar * zNear ) / ( zNear - zFar );

	// W result (= Z in)
	m[ 3 * 4 + 0 ] = 0.0;
	m[ 3 * 4 + 1 ] = 0.0;
	m[ 3 * 4 + 2 ] = handednessScale;
	m[ 3 * 4 + 3 ] = 0.0;

	mobj.transpose();

	return mobj;

}

/**
 * Virtual Reality EffectComposer pass
 */
THREE.VRPass = function ( scene, camera, vrHMD, overrideMaterial, clearColor, clearAlpha ) {
	THREE.Pass.call(this);

	this.scene = scene;
	this.camera = camera;

	this.overrideMaterial = overrideMaterial;

	this.clearColor = clearColor;
	this.clearAlpha = ( clearAlpha !== undefined ) ? clearAlpha : 0;

	this.clear = true;
	this.needsSwap = false;

	this.vrHMD = vrHMD;
	this.isDeprecatedAPI = vrHMD && (vrHMD instanceof HMDVRDevice);
	this.eyeTranslationL = new THREE.Vector3();
	this.eyeTranslationR = new THREE.Vector3();
	this.renderRectL = null;
	this.renderRectR = null;
	this.eyeFOVL = null;
	this.eyeFOVR = null;

	this.requestPresentCallback = null;

	//

	this.scale = 1;

	// render

	this.cameraL = new THREE.PerspectiveCamera();
	this.cameraL.layers.enable( 1 );

	this.cameraR = new THREE.PerspectiveCamera();
	this.cameraR.layers.enable( 2 );

	// If user did not specify a VR device, try to get one now
	function gotVRDevices( devices ) {

		for ( var i = 0; i < devices.length; i ++ ) {

			if ( 'VRDisplay' in window && devices[ i ] instanceof VRDisplay ) {

				this.vrHMD = devices[ i ];
				this.isDeprecatedAPI = false;
				break; // We keep the first we encounter

			} else if ( 'HMDVRDevice' in window && devices[ i ] instanceof HMDVRDevice ) {

				this.vrHMD = devices[ i ];
				this.isDeprecatedAPI = true;
				break; // We keep the first we encounter

			}

		}
	}

	// Query for VR displays
	if ( navigator.getVRDisplays ) {
		navigator.getVRDisplays().then( gotVRDevices.bind(this) );
	} else if ( navigator.getVRDevices ) {
		navigator.getVRDevices().then( gotVRDevices.bind(this) );
	}

};

THREE.VRPass.prototype = Object.assign( Object.create( THREE.Pass.prototype ), {

	constructor: THREE.VRPass,

	render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

		// Apply material override
		this.scene.overrideMaterial = this.overrideMaterial;

		// apply clear color
		var oldClearColor, oldClearAlpha;
		if ( this.clearColor ) {

			oldClearColor = renderer.getClearColor().getHex();
			oldClearAlpha = renderer.getClearAlpha();

			renderer.setClearColor( this.clearColor, this.clearAlpha );

		}

		// Check for VR pass
		if ( this.vrHMD && this.vrHMD.isPresenting ) {

			var autoUpdate = this.scene.autoUpdate;

			if ( autoUpdate ) {

				this.scene.updateMatrixWorld();
				this.scene.autoUpdate = false;

			}

			var eyeParamsL = this.vrHMD.getEyeParameters( 'left' );
			var eyeParamsR = this.vrHMD.getEyeParameters( 'right' );

			if ( ! this.isDeprecatedAPI ) {

				this.eyeTranslationL.fromArray( eyeParamsL.offset );
				this.eyeTranslationR.fromArray( eyeParamsR.offset );
				this.eyeFOVL = eyeParamsL.fieldOfView;
				this.eyeFOVR = eyeParamsR.fieldOfView;

			} else {

				this.eyeTranslationL.copy( eyeParamsL.eyeTranslation );
				this.eyeTranslationR.copy( eyeParamsR.eyeTranslation );
				this.eyeFOVL = eyeParamsL.recommendedFieldOfView;
				this.eyeFOVR = eyeParamsR.recommendedFieldOfView;

			}

			// When rendering we don't care what the recommended size is, only what the actual size
			// of the backbuffer is.
			var size = renderer.getSize();
			this.renderRectL = { x: 0, y: 0, width: size.width / 2, height: size.height };
			this.renderRectR = { x: size.width / 2, y: 0, width: size.width / 2, height: size.height };

			if ( this.camera.parent === null ) this.camera.updateMatrixWorld();

			this.cameraL.projectionMatrix = fovToProjection( this.eyeFOVL, true, this.camera.near, this.camera.far );
			this.cameraR.projectionMatrix = fovToProjection( this.eyeFOVR, true, this.camera.near, this.camera.far );

			this.camera.matrixWorld.decompose( this.cameraL.position, this.cameraL.quaternion, this.cameraL.scale );
			this.camera.matrixWorld.decompose( this.cameraR.position, this.cameraR.quaternion, this.cameraR.scale );

			var scale = this.scale;
			this.cameraL.translateOnAxis( this.eyeTranslationL, scale );
			this.cameraR.translateOnAxis( this.eyeTranslationR, scale );

			if (this.renderToScreen) {

				renderer.setScissorTest( true );
				if (this.clear) renderer.clear();

				// render left eye
				renderer.setViewport( this.renderRectL.x, this.renderRectL.y, this.renderRectL.width, this.renderRectL.height );
				renderer.setScissor( this.renderRectL.x, this.renderRectL.y, this.renderRectL.width, this.renderRectL.height );
				renderer.render( this.scene, this.cameraL );

				// render right eye
				renderer.setViewport( this.renderRectR.x, this.renderRectR.y, this.renderRectR.width, this.renderRectR.height );
				renderer.setScissor( this.renderRectR.x, this.renderRectR.y, this.renderRectR.width, this.renderRectR.height );
				renderer.render( this.scene, this.cameraR );

				renderer.setScissorTest( false );

			} else {

				// Disable auto-clear on renderer
				renderer.autoClear = false;
				// renderer.setScissorTest( true );
				// renderer.clear();

				// render left eye on texture
				readBuffer.viewport.set( this.renderRectL.x, this.renderRectL.y, this.renderRectL.width, this.renderRectL.height );
				readBuffer.scissor.set( this.renderRectL.x, this.renderRectL.y, this.renderRectL.width, this.renderRectL.height );
				renderer.render( this.scene, this.cameraL, readBuffer, this.clear );

				// render right eye on texture
				readBuffer.viewport.set( this.renderRectR.x, this.renderRectR.y, this.renderRectR.width, this.renderRectR.height );
				readBuffer.scissor.set( this.renderRectR.x, this.renderRectR.y, this.renderRectR.width, this.renderRectR.height );
				renderer.render( this.scene, this.cameraR, readBuffer, false );

				// renderer.setScissorTest( false );
				renderer.setViewport( 0, 0, size.width, size.height );
				renderer.setScissor( 0, 0, size.width, size.height );
				readBuffer.viewport.set( 0, 0, size.width, size.height );
				readBuffer.scissor.set( 0, 0, size.width, size.height );

			}

			if ( autoUpdate ) {

				this.scene.autoUpdate = true;

			}

			if ( ! this.isDeprecatedAPI ) {

				this.vrHMD.submitFrame();

			}

		} else {

			// Regular render mode if not HMD
			renderer.render( this.scene, this.camera, this.renderToScreen ? null : readBuffer, this.clear );

		}

		// Restore clear color
		if ( this.clearColor ) {
			renderer.setClearColor( oldClearColor, oldClearAlpha );
		}

		// Restore scene material override
		this.scene.overrideMaterial = null;

	}

});

