/**
 * @author ioannis Charalampidis / http://wavesoft.github.io/
 *
 * Overlay shader used by GUI pass
 */

var THREE = require('three');

THREE.OverlayShader = {

	uniforms: {

		"tBack": { value: null },
		"tFront": { value: null },
		"opacity":  { value: 1.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform float opacity;",

		"uniform sampler2D tBack;",
		"uniform sampler2D tFront;",

		"varying vec2 vUv;",

		"void main() {",

			"vec4 c_front = texture2D(tFront, vUv);",
			"vec4 c_back = texture2D(tBack, vUv);",
			"gl_FragColor = mix(c_back, c_front, c_front.a);",

		"}"

	].join( "\n" )

};
