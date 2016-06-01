var path 	= require('path');
var gulp 	= require('gulp');
var less 	= require('gulp-less');
var jbb 	= require('gulp-jbb');
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
				'three': 'IconeezinRuntime.lib.three',
				'jquery': 'IconeezinRuntime.lib.jquery',
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
	return gulp.src('src/website/js/index.jsx')
		.pipe(webpack({
			module: {
				loaders: [
					{
						test: /\.jsx?$/,
						exclude: /(node_modules|bower_components)/,
						loader: 'babel',
						query: {
							presets: ['react', 'es2015']
						}
					}
				],
			},
			node: {
				fs: 'empty'
			},
			output: {
				filename: 'iconeezin-web.js',
			},
			externals: {
				'iconeezin/api': 'IconeezinAPI',
				'iconeezin/runtime': 'IconeezinRuntime',
				'three': 'IconeezinRuntime.lib.three',
				'jquery': 'IconeezinRuntime.lib.jquery',
			},
			plugins: [
				new webpack.webpack.optimize.DedupePlugin(),
				// new webpack.webpack.optimize.UglifyJsPlugin({
				// 	minimize: true
				// })
			],
			resolve: {
				extensions: ['', '.js', '.jsx'],
				modulesDirectories: [
					'lib', 'node_modules'
				]
			}
		}))
		.pipe(gulp.dest('build/js'))
});

/**
 * Compile css
 */
gulp.task('css/website', function() {
	return gulp.src('src/website/css/*.less')
		.pipe(less({
		}))
		.pipe(gulp.dest('build/css'));
});

/**
 * Copy static files
 */
gulp.task('html/website', function() {
	return gulp.src(['src/website/html/index.html'])
		.pipe(gulp.dest('build'));
});

/**
 * Compile experiments
 */
gulp.task('experiments/simple', function() {
	return gulp
		.src([ 'experiments/simple.jbbsrc' ])
		.pipe(jbb({ }))
		.pipe(gulp.dest('build/experiments'));
});

/**
 * Stay live
 */
gulp.task('live', ['default'], function() {
	gulp.watch('src/api/**', ['js/api'], function(event) { })
	gulp.watch('src/runtime/**', ['js/runtime'], function(event) { })
	gulp.watch('src/website/js/**', ['js/website'], function(event) { })
	gulp.watch('src/website/html/**', ['html/website'], function(event) { })
	gulp.watch('src/website/css/*.less', ['css/website'], function(event) { })
});

/**
 * Entry point
 */
gulp.task('default', [ 'js/api', 'js/runtime', 'js/website', 'html/website', 'css/website' ], function() {
});
