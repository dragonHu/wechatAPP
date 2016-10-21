var gulp = require('gulp'),
    imagemin = require('gulp-imagemin'),
    htmlmin=require('gulp-htmlmin'),
    sass = require('gulp-ruby-sass'),
    minifycss = require('gulp-minify-css'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'), //js压缩
    rename = require('gulp-rename'), //重命名
    concat = require('gulp-concat'), //合并
    clean = require('gulp-clean');
//文件目录
csrc = './LingDong/';
sdist = './LingDong/';
gulp.task('default', function() {
    //默认任务执行
    //清除所有文件
    gulp.src([sdist+'*'],{read:false}).pipe(clean());
});
//HTML处理
gulp.task('html', function() {
    var htmlsrc = csrc + '**/*.html';
    console.log(htmlsrc);
    gulp.src(htmlsrc).pipe(htmlmin({collapseWhitespace: true})).pipe(gulp.dest(sdist));
});
//样式处理
gulp.task('css', function() {
    var cssSrc = csrc + 'css/*.css',
        cssDst = sdist + 'css';
    gulp.src(cssSrc).pipe(rename({
        suffix: '.min'
    })).pipe(concat('style.css')).pipe(minifycss()).pipe(gulp.dest(cssDst));
});
//js处理
gulp.task('js', function() {
    var jsSrc = csrc + 'tools/*.js',
        importJs=csrc + '*.js', 
        jsDst = sdist + '/js';
    gulp.src([jsSrc,importJs]).pipe(jshint.reporter('default'))
    .pipe(concat('main.js'))
    .pipe(rename({suffix:'.min'}))
    .pipe(uglify())
    .pipe(gulp.dest(jsDst));
});
//image处理
gulp.task('image', function() {
    var imgsrc = csrc + '/images/*.*';
    gulp.src(imgsrc).pipe(imagemin()).pipe(gulp.dest(sdist+'images'));
});

//调用集成命令2
gulp.task('uglify', function() {
    //清除文件
    gulp.src([sdist+'/js/'],{read:true}).pipe(clean());
    gulp.run(['js','css','image']);
    console.log('调用集成命令2');
});
