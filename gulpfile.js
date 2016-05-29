var path = require('path');
var gulp = require('gulp');
// var less = require('gulp-less');
// var uglify = require('gulp-uglifyjs');
var webpack = require('webpack-stream');

/**
 * Compile and pack Javascript files
 */
gulp.task('js/api', function() {
	return gulp.src('src/api/index.js')
		.pipe(webpack({
			node: {
				fs: 'empty'
			},
			output: {
				filename: 'iconeezin-api.js',
				libraryTarget: 'var',
				library: 'IconeezinAPI'
			},
			externals: {
				'iconeezin/runtime': 'IconeezinRuntime',
			},
			plugins: [
				new webpack.webpack.optimize.DedupePlugin(),
				// new webpack.webpack.optimize.UglifyJsPlugin({
				// 	minimize: true
				// })
			],
			resolve: {
				modulesDirectories: [
					'lib', 'node_modules'
				],
				alias: {
					'iconeezin' : path.join(__dirname, 'src'),
				}
			}
		}))
		.pipe(gulp.dest('build/js'))
});

/**
 * Compile and pack Javascript files
 */
gulp.task('js/runtime', function() {
	return gulp.src('src/runtime/index.js')
		.pipe(webpack({
			node: {
				fs: 'empty'
			},
			output: {
				filename: 'iconeezin-runtime.js',
				libraryTarget: 'var',
				library: 'IconeezinRuntime'
			},
			externals: {
				'iconeezin/api': 'IconeezinAPI',
			},
			plugins: [
				new webpack.webpack.optimize.DedupePlugin(),
				// new webpack.webpack.optimize.UglifyJsPlugin({
				// 	minimize: true
				// })
			],
			resolve: {
				modulesDirectories: [
					'lib', 'node_modules'
				],
				alias: {
					'iconeezin' : path.join(__dirname, 'src'),
				}
			}
		}))
		.pipe(gulp.dest('build/js'))
});

/**
 * Compile and pack Javascript files
 */
gulp.task('js/website', function() {
	return gulp.src('src/website/js/index.js')
		.pipe(webpack({
			node: {
				fs: 'empty'
			},
			output: {
				filename: 'iconeezin-web.js',
			},
			externals: {
				'iconeezin/api': 'IconeezinAPI',
				'iconeezin/runtime': 'IconeezinRuntime',
			},
			plugins: [
				new webpack.webpack.optimize.DedupePlugin(),
				// new webpack.webpack.optimize.UglifyJsPlugin({
				// 	minimize: true
				// })
			],
			resolve: {
				modulesDirectories: [
					'lib', 'node_modules'
				]
			}
		}))
		.pipe(gulp.dest('build/js'))
});

// /**
//  * Compile and pack Javascript files
//  */
// gulp.task('js', function() {
// 	return gulp.src('src/audioexpo.js')
// 		.pipe(webpack({
// 			module: {
// 				loaders: [
// 					{ test: /\.json$/, loader: 'json' },
// 					{
// 						test: /\.(mp3|ogg)$/,
// 						loader: 'file?name=media/audio/[hash].[ext]'
// 					},
// 					{
// 						test: /\.(gif|jpe?g|png)$/,
// 						loader: 'file?name=media/img/[hash].[ext]'
// 					},
// 					{
// 						test: /\.jsx?$/,
// 						exclude: /(node_modules|bower_components)/,
// 						loader: 'babel',
// 						query: {
// 							presets: ['react', 'es2015']
// 						}
// 					}
// 				],
// 			},
// 			node: {
// 				fs: 'empty'
// 			},
// 			output: {
// 				filename: 'audioexpo.js'
// 			},
// 			plugins: [
// 				new webpack.webpack.optimize.DedupePlugin(),
// 				// new webpack.webpack.optimize.UglifyJsPlugin({
// 				// 	minimize: true
// 				// })
// 			],
// 			resolve: {
// 				modulesDirectories: [
// 					'lib', 'node_modules'
// 				],
// 				alias: {

// 					/* Aliasing of audio-expo components */
// 					'experiments' : path.join(__dirname, 'experiments'),
// 					'audio-expo'  : path.join(__dirname, 'src'),

// 				}
// 			}
// 		}))
// 		.pipe(gulp.dest('build'))
// });

// /**
//  * Compile css
//  */
// gulp.task('static/css', function() {
// 	return gulp.src('static/css/*.less')
// 		.pipe(less({
// 		}))
// 		.pipe(gulp.dest('build/media/css'));
// });

// /**
//  * Copy static files
//  */
// gulp.task('static/index', function() {
// 	return gulp.src('static/index.html')
// 		.pipe(gulp.dest('build'));
// });

// /**
//  * Copy remaining static resources
//  */
// gulp.task('static', function() {
// 	return gulp.src(['static/**/*', '!static/css/*.less', '!static/index.html'])
// 		.pipe(gulp.dest('build/media'));
// });

// /**
//  * Entry point
//  */
// gulp.task('default', [ 'static', 'static/css', 'static/index', 'js' ], function() {
// });

// /**
//  * Stay live
//  */
// gulp.task('live', ['default'], function() {
// 	gulp.watch('src/**', ['js'], function(event) { })
// 	gulp.watch('static/css/*.less', ['static/css'], function(event) { })
// });

/**
 * Entry point
 */
gulp.task('default', [ 'js/api', 'js/runtime', 'js/website' ], function() {
});
