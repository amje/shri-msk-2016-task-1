'use strict';
var gulp = require('gulp');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');

gulp.task('sass', function() {
  return gulp.src('src/style/main.scss')
      .pipe(sourcemaps.init())
      .pipe(sass({
        outputStyle: 'expanded'
      }))
      .pipe(autoprefixer({
        browsers: ['last 2 version'],
        cascade: false
      }))
      .pipe(sourcemaps.write())
      .pipe(gulp.dest('.'));
});

gulp.task('watch', function() {
    gulp.watch('src/style/*.scss', [sass]);
});
