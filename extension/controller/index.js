/*
 * Copyright 2018 Your Company ISC License License
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 * Created by mallanic <maxime@allanic.me> at 05/06/2018
 */

const $q = require('q');
const $glob = require('glob');
const $lodash = require('lodash');
const $path = require('path');
const $express = require('express');

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

    app.use($express.json());

    app.apis = [];

    return $q.nfcall($glob, __dirname + '../../../controller/*').then((controllers) => {
        app.controllers = $lodash.map(controllers, (controller) => {
            const path = $path.basename(controller, $path.extname(controller));
            controller = require(controller);
            controller.path = path;

            if (controller.api) {
                app.get(`/api/${path}`, wrapperApi(controller.api.getList));
                app.post(`/api/${ path }`, wrapperApi(controller.api.create));
                app.put(`/api/${ path }/:id`, wrapperApi(controller.api.update))
                app.delete(`/api/${ path }/:id`, wrapperApi(controller.api.delete));
            }

            return controller;
        });
    });
};

module.exports.requires = [ 'logger' ];
