
'use strict';

var gulp = require('gulp'),
  child_process = require('child_process'),
  eslint = require('gulp-eslint');

gulp.task('lint', function() {
  return gulp.src(['**/*.js', '!node_modules/**', '!test/**', '!coverage/**'])
    .pipe(eslint())
    .pipe(eslint.format());
});

gulp.task('test', function() {
  child_process.spawn('istanbul', ['cover', '_mocha', '--', '--recursive', '-G'], {stdio:'inherit'})
    .on('close', function(code) {
      process.exit(code);
    });
});
