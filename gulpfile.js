
'use strict';

const gulp = require('gulp');
const child_process = require('child_process');
const eslint = require('gulp-eslint');

gulp.task('lint', () => {
  return gulp.src(['**/*.js', '!node_modules/**', '!test/**', '!coverage/**'])
    .pipe(eslint())
    .pipe(eslint.format());
});

gulp.task('test', () => {
  child_process.spawn('istanbul', ['cover', '_mocha', '--', '--recursive', '-G'], {stdio:'inherit'});
});
