/*
 * Copyright 2018 Allanic.me ISC License License
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 * Created by mallanic <maxime@allanic.me> at 06/06/2018
 */

const $q = require('q');
const $glob = require('glob');
const $lodash = require('lodash');
const $path = require('path');
const $process = require('process');

const $extension = module.exports = {
    hasDependencyInjected: (extensions, extension) => {
        injectedExt = $lodash.find(extensions, (dep) => {
            return dep.path === extension.path;
        });
        //console.log(extension.extensionName, injectedExt ? injectedExt.extensionName : null);
        if (injectedExt)
            return false;

        if (!$lodash.isArray(extension.requires)
            || extension.requires.length <= 0)
            return true;

        return $lodash.every(extension.requires, (ext) => {
            return $lodash.some(extensions, (dep) => {
                return dep.path === ext;
            });
        });
    },
    load: (app, path) => {
        app.debug = ($process.env.NODE_ENV || 'dev') === 'dev';

        app.use((req, res, next) => {
            app.$emit('routeHandle', req, res).then(() => {
                next();
            }, (error) => {
                app.logger.error(error);
                res.status(error.httpCode || 403).send(error);
            });
        });

        var events = {};
        app.$on = (name, callback) => {
            if (!events[ name ])
                events[ name ] = [];
            events[ name ].push(callback);
        };

        app.$emit = (name, ...args) => {
            return $lodash.reduce(events[ name ], (promise, event) => {
                return promise.then(() => {
                    return event.apply(null, args);
                });
            }, $q.resolve());
        };

        return $q.nfcall($glob, $path.join(path, '*')).then((extensions) => {
            // Preload all extensions
            extensions = $lodash.map(extensions, (extension) => {
                const e = require(extension);
                e.path = $path.basename(extension, $path.extname(extension));
                return e;
            });

            // Order extension by dependencies
            const sortedExtension = [];

            while (extensions.length > sortedExtension.length) {
                $lodash.forEach(extensions, (extension) => {
                    if ($extension.hasDependencyInjected(sortedExtension, extension))
                        sortedExtension.push(extension);
                });
            }

            // Load all extensions
            return $lodash.reduce(sortedExtension, (promise, extension) => {
                return promise.then(() => {
                    return extension(app);
                });
            }, $q.resolve());
        }).then(() => {
            // Emit an event
            return app.$emit('extension.loaded');
        });
    }
}
