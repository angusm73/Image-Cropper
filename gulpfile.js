const st = require('st')
const http = require('http')
const gulp = require('gulp')
const babel = require('gulp-babel')
const sourcemaps = require('gulp-sourcemaps')
const livereload = require('gulp-livereload')



gulp.task('html', () => {
    // copy html -> dist/
    gulp.src('**.htm')
        .pipe(gulp.dest('../dist'))
        .pipe(livereload())
})

gulp.task('css', () => {
    // copy css -> dist/
    gulp.src('css/**.css')
        .pipe(gulp.dest('../dist/css'))
        .pipe(livereload())
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
        .pipe(livereload())
})



gulp.task('serve', (done) => {
    http.createServer(
        // st(process.cwd())
        st({
            path: __dirname + '/../dist',
            index: 'index.htm',
            cache: false
        })
    ).listen(1337, done)
})

gulp.task('build', () => {
    gulp.run('html', 'css', 'js')
})

gulp.task('watch', ['serve'], () => {
    livereload.listen({ basePath: '../dist' })
    gulp.watch('**.htm', ['html'])
    gulp.watch('css/*.css', ['css'])
    gulp.watch('js/*.js', ['js'])
})



gulp.task('default', () => {
    gulp.run('build', 'watch')
})
