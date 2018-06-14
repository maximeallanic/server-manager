/*
 * Copyright 2018 Allanic ISC License License
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 * Created by mallanic <maxime@allanic.me> at 05/06/2018
 */

const $fs = require('fs');
const $path = require('path');
const $q = require('q');

const configFile = $path.join(__dirname, 'config.json');

module.exports = (app) => {
    var config = {};

    app.config = {
        get: (key) => {
            if (key)
                return config[ key ].value;
            return $lodash.mapValues(config, 'value');
        },
        set: (key, value) => {
            config[ key ].value = value;
            $q.nfcall($fs.writeFile, configFile, JSON.stringify(config));
        },
        getFields: () => {
            return config;
        },
        addField: (key, form) => {
            if (!config[ key ]) {
                config[ key ] = form;
                $q.nfcall($fs.writeFile, configFile, JSON.stringify(config));
            }
        }
    };

    return $q.nfcall($fs.readFile, configFile).then((content) => {
        config = JSON.parse(content);
    }, $q.resolve);
};
