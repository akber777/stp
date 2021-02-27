// Include gulp
let gulp = require("gulp");

// Include Our Plugins
let sass = require('gulp-sass');
let postcss = require('gulp-postcss');
let watch = require('gulp-watch');
let rigger = require('gulp-rigger');
let minify = require('gulp-minify');
let minifyCSS = require('gulp-minify-css');
let rename = require("gulp-rename"); //minify elediyimiz dosyanın adını değiştirmek için kullandık bunu
let concat = require('gulp-concat'); //tüm js dosyalarını birleştirip all.js diye bir js dosyasında toplamak için
let flatten = require('gulp-flatten'); //fondaki klasör altında olan fontları tek klasöre toplamak için
let imagemin = require('gulp-imagemin');
let imageminMozjpeg = require('imagemin-mozjpeg');
let autoprefixer = require('gulp-autoprefixer');
let babel = require('gulp-babel');
let browserSync = require('browser-sync').create();
let del = require('del');
let paths = require('path');


let path = {
    build: { //Burada işlemden sonra bitmiş dosyaların nereye koyulacağını gösteriyoruz
        html: 'build/',
        js: 'build/js/',
        vendor: 'build/js/vendor/', //src deki vendor klasörünü buildeki vendor klasörüne eklemek için
        css: 'build/css/main/',
        images: 'build/img/',
        fonts: 'build/fonts/',
        libs: 'build/libs/' //bower ile src klasörüne yüklediğim dosyaları build klasörüne eklemek için
    },
    src: { //Burası kaynaklar
        html: 'src/*.html', //Синтаксис src/*.html говорит gulp что мы хотим взять все файлы с расширением .html
        js: 'src/js/main/**/*.js',
        vendor: 'src/js/vendor/*.js',
        css: 'src/css/main.scss',
        images: 'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*',
        libs: 'src/libs/**/*.*'
    },
    watch: { //Burada izlemek istediğimiz dosyaları belirtiyoruz
        html: 'src/**/*.html',
        js: 'src/js/main/*.js',
        vendor: 'src/js/vendor/*.js',
        css: 'src/css/**/*.scss',
        images: 'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*',
        libs: 'src/libs/**/*.*'
    },
};



gulp.task('browserSync:build', function () {
    browserSync.init({
        server: {
            baseDir: 'build'
        },
        port: 8080
    })
})

gulp.task('html:build', async function () {
    gulp.src(path.src.html)
        .on('error', function (err) {
            console.log(err)
            this.emit('end')
        })
        .pipe(rigger()) //rigger ile dosyaları birleşdiriyoruz header footer gibi komponentleri import ediyoruz bir nevi
        .pipe(gulp.dest(path.build.html)) //Выплюнем их в папку build
});

gulp.task('js:build', async function () {
    gulp.src(path.src.js) //burdakileri al derle
        .pipe(concat('all.js'))
        .pipe(babel({
            presets: ['@babel/env'],
            "plugins": ["@babel/plugin-proposal-class-properties"]
        }))
        .pipe(gulp.dest(path.build.js)) //minify etmeden all.js dosyasını ekledik aşağıdaki noSource: true  komutunu silersek buna gerek olmayacak sanırım denemedim ama mantık olarak o kod minify olunmamışını eklemesini engelliyor
        .pipe(minify({
            ext: {

                min: '.min.js'
            },
            noSource: true //bu build altındaki js klasörüne düşen index.js yi düşürmüyor sadece min olan düşüyor
        }))
        .pipe(babel({
            presets: ['@babel/env'],
            "plugins": ["@babel/plugin-proposal-class-properties"],
            "plugins": ["@babel/plugin-proposal-export-namespace-from"],
            "plugins": ["@babel/plugin-proposal-nullish-coalescing-operator"],
            "plugins": ["@babel/plugin-proposal-numeric-separator"],
            "plugins": ["@babel/plugin-proposal-optional-chaining"]
        }))
        .pipe(gulp.dest(path.build.js)); //derlenmiş dosyayı buraya at
});


gulp.task('css:build', async function () {
    gulp.src(path.src.css) //Bizim main.scss seçer
        .pipe(sass()) //sass da derler
        .on('error', function (err) {
            console.log(err)
            this.emit('end')
        })
        .pipe(autoprefixer({
            cascade: false
        }))
        .pipe(gulp.dest(path.build.css))
        .pipe(minifyCSS())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(path.build.css)); //build deki css e atar
});


gulp.task('image:build', async function () {
    gulp.src(path.src.images) //resimleri seçer
        .on('error', function (err) {
            console.log(err)
            this.emit('end')
        })
        .pipe(imagemin({
            use: [
                imageminMozjpeg()
            ]
        }))
        .pipe(gulp.dest(path.build.images));

});

gulp.task('libs:build', async function () {
    gulp.src(path.src.libs)
        .on('error', function (err) {
            console.log(err)
            this.emit('end')
        })
        .pipe(gulp.dest(path.build.libs));
});


gulp.task('vendor:build', async function () {
    gulp.src(path.src.vendor)
        .on('error', function (err) {
            console.log(err)
            this.emit('end')
        })
        .pipe(gulp.dest(path.build.vendor));
});

gulp.task('fonts:build', async function () {
    gulp.src(path.src.fonts)
        .on('error', function (err) {
            console.log(err)
            this.emit('end')
        })
        .pipe(flatten())
        .pipe(gulp.dest(path.build.fonts))
});


gulp.task('server', async function () {
    browserSync.init({
        server: "build",
        port: 8800,
        ui: {
            port: 7700
        }
    })
});


gulp.task('build', gulp.series(
    'html:build',
    'js:build',
    'css:build',
    'fonts:build',
    'image:build',
    'libs:build',
    'vendor:build',
    'server'
));


gulp.task('watch', function () {
    gulp.watch([path.watch.html], gulp.series('html:build')).on('change', browserSync.reload).on('unlink', function (filepath) {
        let filePathFromSrc = paths.relative(paths.resolve('src'), filepath) // html faylarinin silinib silinmediyi src icinde kontrol edilir

        let destFilePath = paths.resolve('build', filePathFromSrc);

        del.sync(destFilePath);

    }),
        gulp.watch([path.watch.css], gulp.series('css:build')).on('change', browserSync.reload),

        gulp.watch([path.watch.js], gulp.series('js:build')).on('change', browserSync.reload),

        gulp.watch([path.watch.images], gulp.series('image:build')).on('change', browserSync.reload).on('unlink', function (filepath) {
            let filePathFromSrc = paths.relative(paths.resolve('src'), filepath) // html faylarinin silinib silinmediyi src icinde kontrol edilir

            let destFilePath = paths.resolve('build', filePathFromSrc);

            del.sync(destFilePath);

        }),

        gulp.watch([path.watch.fonts], gulp.series('fonts:build')).on('change', browserSync.reload).on('unlink', function (filepath) {
            
            
            let filePathFromSrc = paths.relative(paths.resolve('src'), filepath) // html faylarinin silinib silinmediyi src icinde kontrol edilir

            let endPath=paths.basename(filePathFromSrc)

            let destFilePath = paths.resolve('build/fonts/', endPath);
            
            del.sync(destFilePath);

        }),

        gulp.watch([path.watch.libs], gulp.series('libs:build')).on('change', browserSync.reload).on('unlink', function (filepath) {

            let nameDir=paths.dirname(filepath)

            let filePathFromSrc = paths.relative(paths.resolve('src'), nameDir) // html faylarinin silinib silinmediyi src icinde kontrol edilir
            
            let destFilePath = paths.resolve('build', filePathFromSrc);
            
            del.sync(destFilePath);

        }),

        gulp.watch([path.watch.vendor], gulp.series('vendor:build')).on('change', browserSync.reload)
});


gulp.task('default', gulp.series('build', 'watch'))
