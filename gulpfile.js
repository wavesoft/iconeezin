var path 	= require('path');
var gulp 	= require('gulp');
var gutil 	= require('gulp-util');
var webpack = require('webpack-stream');
var PROD = (process.env.NODE_ENV || "production") == "production";

/**
 * Compile and pack Javascript files
 */
gulp.task('js/iconeezin', function() {
	return gulp.src('index.js')
		.pipe(webpack({
			module: {
				loaders: [
					{ test: /\.json$/, loader: 'json' },
					{ test: /\.(png|jpg)$/, loader: 'url-loader?limit=8192&name=img/[name].[ext]' }
				]
	    },
			node: {
				fs: 'empty'
			},
			output: {
				filename: 'iconeezin.js',
				libraryTarget: 'var',
				library: 'Iconeezin'
			},
			plugins: PROD ? [
				new webpack.webpack.optimize.DedupePlugin(),
				new webpack.webpack.optimize.UglifyJsPlugin({
					minimize: true
				})
			] : [],
			resolve: {
				modulesDirectories: [
					'lib', 'node_modules'
				],
				alias: {

					// NOTE: Used by jbb-profile-iconeezin
					'iconeezin/api' : path.join(__dirname, 'api.js'),

					// NOTE: Bugfix for nested modules
					'three' : path.join(__dirname, 'node_modules/three'),
					'jbb' : path.join(__dirname, 'node_modules/jbb'),
					'jbb-profile-three' : path.join(__dirname, 'node_modules/jbb-profile-three'),
					'jbb-profile-iconeezin' : path.join(__dirname, 'node_modules/jbb-profile-iconeezin')

				}
			}
		}))
		.pipe(gulp.dest('dist'))
});

/**
 * Stay live
 */
gulp.task('live', ['default'], function() {
	gulp.watch('src/**', ['js/iconeezin'], function(event) { })
});

/**
 * Entry point
 */
gulp.task('default', [ 'js/iconeezin' ], function() {
});
