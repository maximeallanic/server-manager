/*
 * Copyright 2018 Your Company ISC License License
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 * Created by mallanic <maxime@allanic.me> at 05/06/2018
 */

const $q = require('q');
const $glob = require('glob');
const $lodash = require('lodash')
         .mixin(require('lodash-keyarrange'));
const $express = require('express');
const $path = require('path');

function loadExtension(app) {
    return $q.nfcall($glob, './extension/*').then((extensions) => {

        // Load all extension
        extensions = $lodash.map(extensions, (extension) => {
            const e = require(extension);
            e.path = $path.basename(extension, $path.extname(extension));
            return e;
        });

        // Order by dependency extension
        const sortedDependency = [];
        function hasDependencyInjected(extension) {
            injectedExt = $lodash.find(sortedDependency, (dep) => {
                return dep.path === extension.path;
            });
            //console.log(extension.extensionName, injectedExt ? injectedExt.extensionName : null);
            if (injectedExt)
                return false;

            if (!$lodash.isArray(extension.requires)
                || extension.requires.length <= 0)
                return true;

            return $lodash.every(extension.requires, (ext) => {
                return $lodash.some(sortedDependency, (dep) => {
                    return dep.path === ext;
                });
            });
        }
        while (extensions.length > sortedDependency.length) {
            $lodash.forEach(extensions, (extension, i) => {

                if (hasDependencyInjected(extension)) {
                    sortedDependency.push(extension);
                }
                //console.log(sortedDependency);
            });
        }

        // Require all extension
        return $lodash.reduce(sortedDependency, (promise, extension) => {
            return promise.then(() => {
                return extension(app);
            });
        }, $q.resolve());
    });
}



const app = $express(), port = process.env.PORT || 80;

loadExtension(app).then(() => {
    app.listen(port);
    app.logger.info(`Ui Router started on: ${port}`);
}, console.error);


