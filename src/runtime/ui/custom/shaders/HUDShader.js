/**
 * @author ioannis Charalampidis / http://wavesoft.github.io/
 *
 * Overlay shader used by GUI pass
 */

var THREE = require('three');

THREE.HUDShader = {

	uniforms: {

		"black_fader"  : { value: 0.0 },

		"layer1_pos"  : { value: new THREE.Vector2(0,0) },
		"layer1_size" : { value: new THREE.Vector2(0,0) },
		"layer1_tex"  : { value: null },

		"layer2_pos"  : { value: new THREE.Vector2(0,0) },
		"layer2_size" : { value: new THREE.Vector2(0,0) },
		"layer2_tex"  : { value: null },

		"layer3_pos"  : { value: new THREE.Vector2(0,0) },
		"layer3_size" : { value: new THREE.Vector2(0,0) },
		"layer3_tex"  : { value: null },

		"layer4_pos"  : { value: new THREE.Vector2(0,0) },
		"layer4_size" : { value: new THREE.Vector2(0,0) },
		"layer4_tex"  : { value: null },

	},

	vertexShader: [

		"void main() {",

			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform vec2 layer1_pos;",
		"uniform vec2 layer1_size;",
		"uniform sampler2D layer1_tex;",

		"uniform vec2 layer2_pos;",
		"uniform vec2 layer2_size;",
		"uniform sampler2D layer2_tex;",

		"uniform vec2 layer3_pos;",
		"uniform vec2 layer3_size;",
		"uniform sampler2D layer3_tex;",

		"uniform vec2 layer4_pos;",
		"uniform vec2 layer4_size;",
		"uniform sampler2D layer4_tex;",

		"uniform float black_fader;",

		"void renderLayer( vec2 pos, vec2 sz, sampler2D tex ) {",
			"vec4 col;",
			"if ((gl_FragCoord.x > pos.x + 1.0) && (gl_FragCoord.y > pos.y + 1.0) &&",
				"(gl_FragCoord.x < pos.x + sz.x - 2.0) && (gl_FragCoord.y < pos.y + sz.y - 2.0)) {",
				"col = texture2D(tex, (gl_FragCoord.xy - pos) / sz);",
				"gl_FragColor = mix(gl_FragColor, col, col.a);",
			"}",
		"}",

		"void main() {",

			"gl_FragColor = vec4( 0.0, 0.0, 0.0, 0.0 );",

			"if (layer1_size.x > 0.0) {",
				"renderLayer( layer1_pos, layer1_size, layer1_tex );",
			"}",
			"if (layer2_size.x > 0.0) {",
				"renderLayer( layer2_pos, layer2_size, layer2_tex );",
			"}",
			"if (layer3_size.x > 0.0) {",
				"renderLayer( layer3_pos, layer3_size, layer3_tex );",
			"}",
			"if (layer4_size.x > 0.0) {",
				"renderLayer( layer4_pos, layer4_size, layer4_tex );",
			"}",

			"gl_FragColor = mix(gl_FragColor, vec4(0.0,0.0,0.0,1.0), 1.0 - black_fader);",


		"}"

	].join( "\n" )

};
