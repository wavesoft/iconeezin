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

var THREE = require('three');

THREE.VREffect = function ( renderer, vrHMD, onError ) {

	var isDeprecatedAPI = false;
	var eyeTranslationL = new THREE.Vector3();
	var eyeTranslationR = new THREE.Vector3();
	var renderRectL, renderRectR;
	var eyeFOVL, eyeFOVR;

	var scope = this;
	scope.vrHMD = vrHMD;
	
	//

	this.isPresenting = false;
	this.scale = 1;

	var rendererSize = renderer.getSize();
	var rendererPixelRatio = renderer.getPixelRatio();

	// render

	var cameraL = new THREE.PerspectiveCamera();
	cameraL.layers.enable( 1 );

	var cameraR = new THREE.PerspectiveCamera();
	cameraR.layers.enable( 2 );

	this.render = function ( scene, camera, renderTarget, forceClear ) {

		if ( scope.vrHMD && scope.vrHMD.isPresenting ) {

			var autoUpdate = scene.autoUpdate;

			if ( autoUpdate ) {

				scene.updateMatrixWorld();
				scene.autoUpdate = false;

			}

			var eyeParamsL = scope.vrHMD.getEyeParameters( 'left' );
			var eyeParamsR = scope.vrHMD.getEyeParameters( 'right' );

			if ( ! isDeprecatedAPI ) {

				eyeTranslationL.fromArray( eyeParamsL.offset );
				eyeTranslationR.fromArray( eyeParamsR.offset );
				eyeFOVL = eyeParamsL.fieldOfView;
				eyeFOVR = eyeParamsR.fieldOfView;

			} else {

				eyeTranslationL.copy( eyeParamsL.eyeTranslation );
				eyeTranslationR.copy( eyeParamsR.eyeTranslation );
				eyeFOVL = eyeParamsL.recommendedFieldOfView;
				eyeFOVR = eyeParamsR.recommendedFieldOfView;

			}

			if ( Array.isArray( scene ) ) {

				console.warn( 'THREE.VREffect.render() no longer supports arrays. Use object.layers instead.' );
				scene = scene[ 0 ];

			}

			// When rendering we don't care what the recommended size is, only what the actual size
			// of the backbuffer is.
			var size = renderer.getSize();
			renderRectL = { x: 0, y: 0, width: size.width / 2, height: size.height };
			renderRectR = { x: size.width / 2, y: 0, width: size.width / 2, height: size.height };

			renderer.setScissorTest( true );
			renderer.clear();

			if ( camera.parent === null ) camera.updateMatrixWorld();

			cameraL.projectionMatrix = fovToProjection( eyeFOVL, true, camera.near, camera.far );
			cameraR.projectionMatrix = fovToProjection( eyeFOVR, true, camera.near, camera.far );

			camera.matrixWorld.decompose( cameraL.position, cameraL.quaternion, cameraL.scale );
			camera.matrixWorld.decompose( cameraR.position, cameraR.quaternion, cameraR.scale );

			var scale = this.scale;
			cameraL.translateOnAxis( eyeTranslationL, scale );
			cameraR.translateOnAxis( eyeTranslationR, scale );


			// render left eye
			renderer.setViewport( renderRectL.x, renderRectL.y, renderRectL.width, renderRectL.height );
			renderer.setScissor( renderRectL.x, renderRectL.y, renderRectL.width, renderRectL.height );
			renderer.render( scene, cameraL, renderTarget, forceClear );

			// render right eye
			renderer.setViewport( renderRectR.x, renderRectR.y, renderRectR.width, renderRectR.height );
			renderer.setScissor( renderRectR.x, renderRectR.y, renderRectR.width, renderRectR.height );
			renderer.render( scene, cameraR, renderTarget, false );

			renderer.setScissorTest( false );

			if ( autoUpdate ) {

				scene.autoUpdate = true;

			}

			if ( ! isDeprecatedAPI ) {

				scope.vrHMD.submitFrame();

			}

			return;

		}

		// Regular render mode if not HMD

		renderer.render( scene, camera, renderTarget, forceClear );

	};

	//

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

};
