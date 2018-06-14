/*
 * Copyright 2018 Allanic ISC License License
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 * Created by mallanic <maxime@allanic.me> at 05/06/2018
 */

const $express = require('express');
const $lodash = require('lodash');
const $q = require('q');

const $glob = require('glob');
const $path = require('path');
const $os = require('os');
const $mkdirp = require('mkdirp');



const modules = [
    'jquery/dist/jquery.min.js',
    'bootstrap/dist/js/bootstrap.min.js',
    'angular/angular.min.js',
    'angular-animate/angular-animate.min.js',
    'angular-messages/angular-messages.min.js',
    'angular1-ui-bootstrap4/dist/ui-bootstrap.js',
    'angular1-ui-bootstrap4/dist/ui-bootstrap-tpls.js',
    '@uirouter/angularjs/release/angular-ui-router.js',
    'ngstorage/ngStorage.min.js',
    'angular1-ui-bootstrap4/dist/ui-bootstrap-csp.css',
    '@fortawesome/fontawesome-free-webfonts/css/*.css',
    '@fortawesome/fontawesome-free-webfonts/webfonts/*!(.svg)'
];

module.exports = (app) => {
    const $webManager = require('./web-manager')(app);

    app.config.addField('title', {
        description: 'Name of Website UI',
        value: 'Rfox',
        type: 'text'
    });

    return app.$on('extension.loaded', () => {
        modules.forEach((module) => {
            $webManager.add($path.join(__dirname, `../../node_modules/${ module }`));
        });
        $webManager.add([
            $path.join(__dirname, 'web/js/module.js'),
            $path.join(__dirname, 'web/**/!(index.html.ejs)')
        ]);
        return app.$emit('web-manager.beforeLoadAssets', $webManager).then(() => {
            $webManager.setIndex($path.join(__dirname, 'web/index.html.ejs'));
            return $webManager.compile().then((o) => {
                $lodash.forEach(o.files, (files) => {
                    $lodash.forEach(files, (file) => {
                        app.get('/' + file, (req, res) => {
                            res.sendFile($path.join(o.base, file));
                        });
                    });
                });
                app.get('*', (req, res) => {
                    res.sendFile($path.join(o.base, o.index));
                });
            });
        });
    });
};

module.exports.requires = [ 'controller', 'authentication', 'config' ];
