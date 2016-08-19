var gulp = require("gulp");
var uglify = require('gulp-uglify');
var babel = require("gulp-babel");
var csso = require('gulp-csso');

gulp.task("default", function () {
  return gulp.src("src/image-upload.js")
    .pipe(babel())
    .pipe(uglify())
    .pipe(gulp.dest("dist"));
});

gulp.task('cssmin', function () {
    return gulp.src('src/image-upload.css')
        .pipe(csso())
        .pipe(gulp.dest('dist'));
});