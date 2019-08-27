const gulp = require('gulp')
const babel = require('gulp-babel')
const server = require('gulp-express')
const sourcemaps = require('gulp-sourcemaps')



gulp.task('html', () => {
    // copy images -> dist/
    gulp.src('src/imgs/**.svg')
        .pipe(gulp.dest('./dist/imgs'))
    // copy html -> dist/
    return gulp.src('demo/**.htm')
        .pipe(gulp.dest('./dist'))
})

gulp.task('css', () =>
    // copy css -> dist/
    gulp.src(['src/img-crop.css', 'demo/demo.css'])
        .pipe(gulp.dest('./dist/css'))
        .pipe(gulp.dest('./dist/css'))
)

gulp.task('js', () =>
    // transpile es6 down to normal js + move -> dist/
    gulp.src(['src/img-crop.js', 'demo/demo.js'])
        .pipe(sourcemaps.init())
        .pipe(babel())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./dist/js'))
        .pipe(gulp.dest('./dist/js'))
)

gulp.task('build', gulp.series('html', 'css', 'js'))

gulp.task('watch', () => {
    gulp.watch('demo/**.htm', gulp.series('html'))
    gulp.watch(['src/**.css', 'demo/**.css'], gulp.series('css'))
    gulp.watch(['src/**.js', 'demo/**.js'], gulp.series('js'))
    // server.run(['demo/server.js'])
    // gulp.watch('*', file => {
    //     server.notify.apply(server, [file])
    // })
})

gulp.task('default', gulp.series('build', 'watch'))
