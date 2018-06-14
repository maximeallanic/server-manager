/*
 * Copyright 2018 Allanic.me ISC License License
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 * Created by mallanic <maxime@allanic.me> at 06/06/2018
 */

const $lodash = require('lodash');
const $q = require('q');

const $path = require('path');
const $os = require('os');
const $gulp = require('gulp');
const $es = require('event-stream');
const $g = {
    ejs: require('gulp-ejs'),
    filter: require('gulp-filter'),
    rename: require('gulp-rename'),
    concat: require('gulp-concat'),
    uglify: require('gulp-uglify'),
    cssmin: require('gulp-cssmin'),
    htmlmin: require('gulp-htmlmin'),
    sass: require('gulp-sass'),
    if: require('gulp-if')
};

module.exports = (app) => {
    const files = [];
    let index;

    const $webManager = {
        add: (file) => {
            if ($lodash.isArray(file))
                return $lodash.map(file, $lodash.unary($webManager.add));
            files.push(file);
        },
        setIndex: (file) => {
            index = file;
        },
        compile: () => {
            const deferred = $q.defer();
            const outputDir = $os.tmpdir() + '/router';
            const filterOption = {
                restore: true
            };
            const filter = {
                ejs: $g.filter('**/*.ejs', filterOption),
                js: $g.filter('**/*.js', filterOption),
                css: $g.filter('**/*.css', filterOption),
                scss: $g.filter('**/*.{scss,sass}', filterOption),
                html: $g.filter('**/*.html', filterOption),
                font: $g.filter('**/*.{ttf,woff,woff2,eot}', filterOption)
            };

            app.files = {};

            $gulp.src(files)
                // EJS Template
                .pipe(filter.ejs)
                .pipe($g.ejs(Object.assign({ _: $lodash }, app)))
                .pipe($g.rename((path) => {
                    const match = path.basename.match(/^(.+)(\.[a-zA-Z0-9]+)$/);
                    path.extname = match[2];
                    path.basename = match[1];
                }))
                .pipe(filter.ejs.restore)


                // JS
                .pipe(filter.js)
                .pipe($g.if(!app.debug, $g.concat('index.js')))
                .pipe($g.if(!app.debug, $g.uglify({
                    mangle: false
                })))
                .pipe($g.rename({
                    dirname: 'script'
                }))
                .pipe(filter.js.restore)

                // SCSS
                .pipe(filter.scss)
                .pipe($g.sass({
                    importer: (url, prev, done) => {
                        //console.log(url, prev, prev.match(/node_modules/));
                        if (prev.match(/node_modules/))
                            return done();
                        var match = url.match(/^([^\/]+)(.*)/);
                        if (match && match[ 1 ] === 'bootstrap')
                            done({
                                file: `${ __dirname }/../../node_modules/bootstrap/scss/${ match[ 2 ] || 'bootstrap' }`
                            });
                        else if (match && match[ 1 ] === 'compass')
                            done({
                                file: `${ __dirname }/../../node_modules/compass-sass-mixins/lib/${ match[ 2 ] ? 'compass/' + match[ 2 ] : 'animate' }`
                            });
                        else
                            done();
                    }
                }))
                .pipe(filter.scss.restore)

                // CSS
                .pipe(filter.css)
                .pipe($g.if(!app.debug, $g.concat('index.css')))
                .pipe($g.if(!app.debug, $g.cssmin()))
                .pipe($g.rename({
                    dirname: 'style'
                }))
                .pipe(filter.css.restore)

                // Font
                .pipe(filter.font)
                .pipe($g.rename({
                    dirname: 'webfonts'
                }))
                .pipe(filter.font.restore)

                // HTML
                .pipe(filter.html)
                .pipe($g.if(!app.debug, $g.htmlmin()))
                .pipe($g.rename({
                    dirname: 'view'
                }))
                .pipe(filter.html.restore)

                .pipe($gulp.dest(outputDir, {
                    cwd: outputDir
                }))
                .pipe($es.map((file, cb) => {
                    let key = 'asset';
                    const extname = file.path.match(/\.([a-zA-Z0-9]+)$/);
                    if (extname) {
                        if (!$lodash.isArray(app.files[ extname[1] ]))
                            app.files[ extname[1] ] = [];
                        app.files[ extname[ 1 ] ].push($path.relative(outputDir, file.path));
                    }
                    return cb();
                }))
                .on('end', () => {
                    $gulp.src(index)
                        .pipe($g.ejs(Object.assign({ _: $lodash }, app)))
                        .pipe($g.rename({
                            dirname: './',
                            extname: '.html',
                            basename: 'index'
                        }))
                        .pipe($gulp.dest(outputDir, {
                            cwd: outputDir
                        }))
                        .on('end', () => {
                            deferred.resolve({
                                base: outputDir,
                                index: '/index.html',
                                files: app.files
                            });
                        })
                        .on('error', deferred.reject);
                })
                .on('error', deferred.reject);
            return deferred.promise;
        }
    };

    return $webManager;
}



module.exports.get = function() {
    // Template generator
    return $q.nfcall($fs.mkdtemp, $os.tmpdir() + '/router').then((folder) => {

        function compileTemplate(file, variables) {
            return $q.nfcall($fs.readFile, file).then((content) => {
                file = file.replace(/\.ejs$/, '');
                content = $lodash.template(content)(variables);
                path = $path.join(folder, $path.basename(file));
                return $q.nfcall($mkdirp, $path.dirname(path)).then(() => {
                    return $q.nfcall($fs.writeFile, path, content).then(() => {
                        return path;
                    });
                });
            });
        }

        const $webManager = {
            add: (file, variables) => {
                if (Array.isArray(file))
                    return $lodash.reduce(file, (promise, f) => {
                        return promise.then(() => {
                            return $webManager.add(f, variables);
                        });
                    }, $q.resolve());
                const extName = $path.extname(file);
                if (extName === '.ejs')
                    return $webManager.addTemplate(file, variables);
                else if (extName === '.js')
                    return $webManager.addJs(file, variables);
                else if (extName === '.css')
                    return $webManager.addCss(file, variables);
                else if (extName === '.eot'
                    || extName === '.ttf'
                    || extName === '.woff'
                    || extName === '.woff2')
                    return $webManager.addFont(file);
                else
                    return $webManager.addAsset(file, variables);
            },
            addTemplate: (file, variables) => {
                const extName = $path.extname(file.replace(/\.ejs$/, ''));
                if (extName === '.js')
                    return $webManager.addJsTemplate(file, variables);
                else if (extName === '.css')
                    return $webManager.addCssTemplate(file, variables);
                else
                    return $webManager.addAssetTemplate(file, variables);
            },
            addJs: (file) => {
                const m = {
                    base: '/script/' + $path.basename(file),
                    file: file
                };
                module.exports.files.js.push(m);
                return $q.resolve(m);
            },
            addJsTemplate: (file, variables) => {
                return compileTemplate(file, variables).then(path => {
                    $webManager.addJs(path);
                });
            },
            addCss: (file) => {
                const m = {
                    base: '/style/' + $path.basename(file),
                    file: file
                };
                module.exports.files.css.push(m);
                return $q.resolve(m);
            },
            addCssTemplate: (file, variables) => {
                return compileTemplate(file, variables).then(path => {
                    $webManager.addCss(path);
                });
            },
            addAsset: (file) => {
                const m = {
                    base: '/asset/' + $path.basename(file),
                    file: file
                };
                module.exports.files.asset.push(m);
                return $q.resolve(m);
            },
            addAssetTemplate: (file, variables) => {
                return compileTemplate(file, variables).then(path => {
                    $webManager.addAsset(path);
                });
            },
            addFont: (file) => {
                const m = {
                    base: '/webfonts/' + $path.basename(file),
                    file: file
                };
                module.exports.files.font.push(m);
                return $q.resolve(m);
            }
        };

        return $webManager;
    });
};
