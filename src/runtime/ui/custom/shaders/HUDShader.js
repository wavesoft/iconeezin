/**
 * @author ioannis Charalampidis / http://wavesoft.github.io/
 *
 * Overlay shader used by GUI pass
 */

var THREE = require('three');

const MAX_LAYERS = 5;

THREE.HUDShader = {

	uniforms: {

		"black_fader" : { value: 0.0 },
		"stereo"  	  : { value: false },

		"size"  	  : { value: new THREE.Vector2(0,0) },

		"layer_pos"	  : { value: [ new THREE.Vector2(0,0),new THREE.Vector2(0,0),new THREE.Vector2(0,0),new THREE.Vector2(0,0),new THREE.Vector2(0,0) ], type: "v2v" },
		"layer_size"  : { value: [ new THREE.Vector2(0,0),new THREE.Vector2(0,0),new THREE.Vector2(0,0),new THREE.Vector2(0,0),new THREE.Vector2(0,0) ], type: "v2v" },
		"layer_tex"   : { value: [ null, null, null, null, null ], type: "tv" }

	},

	vertexShader: [

		"void main() {",

			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform vec2 layer_pos["+MAX_LAYERS+"];",
		"uniform vec2 layer_size["+MAX_LAYERS+"];",
		"uniform sampler2D layer_tex["+MAX_LAYERS+"];",

		"uniform vec2 size;",
		"uniform bool stereo;",
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

			"for (int i = 0; i<"+MAX_LAYERS+"; ++i) {",
				"if (layer_size[i].x > 0.0) {",
					"if (stereo) {",
						"float ofs = (layer_pos[i].x / (size.x - layer_size[i].x)) * layer_size[i].x / 2.0;",
						"float layer_mid = layer_pos[i].x / 2.0;",
						"float screen_mid = size.x / 2.0;",
						"renderLayer( vec2( layer_mid - ofs, layer_pos[i].y ), layer_size[i], layer_tex[i] );",
						"renderLayer( vec2( screen_mid + layer_mid - ofs, layer_pos[i].y ), layer_size[i], layer_tex[i] );",
					"} else {",
						"renderLayer( layer_pos[i], layer_size[i], layer_tex[i] );",
					"}",
				"}",
			"}",

			"gl_FragColor = mix(gl_FragColor, vec4(0.0,0.0,0.0,1.0), black_fader);",


		"}"

	].join( "\n" )

};
