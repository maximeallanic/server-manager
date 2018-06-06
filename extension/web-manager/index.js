/*
 * Copyright 2018 Your Company ISC License License
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 * Created by mallanic <maxime@allanic.me> at 05/06/2018
 */

const $express = require('express');
const $lodash = require('lodash');
const $q = require('q');
const $fs = require('fs');
const $glob = require('glob');
const $path = require('path');
const $os = require('os');
const $mkdirp = require('mkdirp');

module.exports = (app) => {
    app.use($express.static(__dirname + '/web'));
    app.use('/bootstrap', $express.static(__dirname + '/../../node_modules/bootstrap/dist'));
    app.use('/jquery', $express.static(__dirname + '/../../node_modules/jquery/dist'));
    app.use('/angular', $express.static(__dirname + '/../../node_modules/angular'));
    app.use('/angular1-ui-bootstrap4', $express.static(__dirname + '/../../node_modules/angular1-ui-bootstrap4/dist'));
    app.use('/angular-ui-router', $express.static(__dirname + '/../../node_modules/@uirouter/angularjs/release'));

    $lodash.forEach(app.controllers, (controller) => {
        const filePath = `${ __dirname }/../../controller/${ controller.path }/${ controller.view }`;
        const path = `/${ controller.path }/${ controller.view }`
        app.use(path, $express.static(filePath));
    });

    // Template generator
    return $q.nfcall($fs.mkdtemp, $os.tmpdir() + '/router').then((folder) => {

        const basePath = __dirname + '/pre-compiled';

        return $q.nfcall($glob, `${ basePath }/**/*.*`).then((files) => {
            return $lodash.reduce(files, (promise, file) => {
                return promise.then(() => {
                    return $q.nfcall($fs.readFile, file).then((content) => {
                        content = $lodash.template(content)(app);
                        file = $path.join(folder, $path.relative(basePath, file.replace(/\.ejs$/, '')));
                        return $q.nfcall($mkdirp, $path.dirname(file)).then(() => {
                            return $q.nfcall($fs.writeFile, file, content);
                        });
                    });
                });
            }, $q.resolve());
        }).then(() => {
            console.log(folder);
            app.use($express.static(folder));
        });;
    })
};

module.exports.requires = [ 'controller', 'authentication' ];
