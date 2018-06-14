/*
 * Copyright 2018 Allanic ISC License License
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 * Created by mallanic <maxime@allanic.me> at 05/06/2018
 */

const $q = require('q');
const $glob = require('glob');
const $lodash = require('lodash');
const $path = require('path');
const $express = require('express');
const $form = require('express-form');

function getForm(config) {
    return $form.apply(null, $lodash.map(config, (f, key) => {
        var d = $form.field(key);
        if (f.required)
            d = d.required();
        if (f.pattern)
            d = d.is(f.pattern);
        return d;
    }));
}

module.exports = (app) => {
    function wrapperApi(api) {
        return function (req, res) {
            $q(api(req)).then((data) => {
                res.send(data);
            }, (error) => {
                app.logger.error(error.message);
                res.status(400).send({
                    message: error.message
                });
            });
        }
    }

    app.use(require('body-parser').json());

    app.use($express.json());

    app.apis = [];

    return $q.nfcall($glob, __dirname + '../../../controller/*').then((controllers) => {
        app.controllers = $lodash.map(controllers, (controllerPath) => {
            const path = $path.basename(controllerPath, $path.extname(controllerPath));
            controller = require(controllerPath);
            controller.dir = controllerPath;
            controller.path = path;

            if (controller.api) {
                app.get(`/api/${ path }`, wrapperApi(controller.api.getList));
                app.post(`/api/${ path }`, getForm(controller.api.form), wrapperApi(controller.api.create));
                app.put(`/api/${ path }/:id`, getForm(controller.api.form), wrapperApi(controller.api.update))
                app.delete(`/api/${ path }/:id`, wrapperApi(controller.api.delete));
            }

            return controller;
        });

        app.$on('web-manager.beforeLoadAssets', (webManager) => {
            webManager.add($lodash.map(app.controllers, (controller) => {
                const file = $path.join(controller.dir, controller.view);
                controller.view = '/view/' + controller.view;
                return file;
            }));

        });
    });
};

module.exports.requires = [ 'logger' ];
