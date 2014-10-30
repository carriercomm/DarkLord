var gulp = require('gulp');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');

var JS_SRC = [
	'!node_modules/**/*.*',
	'!gulpfile.js',
	'**/*.js'
];

gulp.task('default', ['lint']);

gulp.task('lint', function () {
	gulp.src(JS_SRC)
		.pipe(jshint('.jshintrc'))
		.pipe(jshint.reporter(stylish));
});

