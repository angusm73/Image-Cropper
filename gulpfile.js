const gulp = require('gulp')
const babel = require('gulp-babel')
const server = require('gulp-express')
const sourcemaps = require('gulp-sourcemaps')



gulp.task('html', () => {
    // copy html -> dist/
    gulp.src('**.htm')
        .pipe(gulp.dest('../dist'))
        .pipe(server.notify())
})

gulp.task('css', () => {
    // copy css -> dist/
    gulp.src('css/**.css')
        .pipe(gulp.dest('../dist/css'))
        .pipe(server.notify())
})

gulp.task('js', () => {
    // transpile es6 down to normal js + move -> dist/
    gulp.src('js/**.js')
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['env']
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('../dist/js'))
        .pipe(server.notify())
})

gulp.task('build', () => {
    gulp.run('html', 'css', 'js')
})

gulp.task('watch', () => {
    server.run(['server.js'])
    gulp.watch('**.htm', ['html'])
    gulp.watch('css/*.css', ['css'])
    gulp.watch('js/*.js', ['js'])
})



gulp.task('default', () => {
    gulp.run('build', 'watch')
})
