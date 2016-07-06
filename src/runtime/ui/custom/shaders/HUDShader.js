/**
 * @author ioannis Charalampidis / http://wavesoft.github.io/
 *
 * Overlay shader used by GUI pass
 */

var THREE = require('three');

THREE.HUDShader = {

	uniforms: {

		// Front and back buffers
		"tBack": { value: null },
		"tFront": { value: null },

		// Normalized size of the centered block
		"size":  { value: new THREE.Vector2(1,1) },

		// Left eye matrix
		"eyeL_offset" : { value: new THREE.Vector2(-0.225,0) },
		"eyeR_offset" : { value: new THREE.Vector2(0.225,0) },
		"eyeL_scale"  : { value: new THREE.Vector2(1,1) },
		"eyeR_scale"  : { value: new THREE.Vector2(1,1) },

		// Enable or disable HMD
		"hmd": { value: false },

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform sampler2D tBack;",
		"uniform sampler2D tFront;",
		"uniform vec2 size;",
		"uniform vec2 eyeL_offset;",
		"uniform vec2 eyeR_offset;",
		"uniform vec2 eyeL_scale;",
		"uniform vec2 eyeR_scale;",
		"uniform bool hmd;",

		"varying vec2 vUv;",

		"const vec2 CENTER = vec2(0.5, 0.5);",
		"const vec2 ZERO = vec2(0.0, 0.0);",
		"const vec2 ONE = vec2(1.0, 1.0);",

		"void renderAt( vec2 center, vec2 scale ) {",
			"vec2 lUv = vUv - center + (size * scale / 2.0);",
			"if ( all(greaterThan(lUv, ZERO)) && all(lessThan(lUv, size * scale)) ) {",
				"lUv /= size * scale;",
				"vec4 c_front = texture2D(tFront, lUv);",
				"gl_FragColor = mix(gl_FragColor, c_front, c_front.a);",
			"}",
		"}",

		"void main() {",

			"gl_FragColor = texture2D(tBack, vUv);",

			"if (hmd) {",
				"renderAt( CENTER + eyeL_offset, eyeL_scale );",
				"renderAt( CENTER + eyeR_offset, eyeR_scale );",
			"} else {",
				"renderAt( CENTER, ONE );",
			"}",

		"}"

	].join( "\n" )

};
