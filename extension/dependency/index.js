/*
 * Copyright 2018 Allanic ISC License License
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 * Created by mallanic <maxime@allanic.me> at 05/06/2018
 */

const $q = require('q');
const $lodash = require('lodash');
const { exec } = require('child_process');

module.exports = (app) => {
    const dependencies = $lodash.compact($lodash.concat.apply(null, $lodash.map(app.controllers, (controller) => controller.packageDependency)));
    if (dependencies.length > 0)
        return $q.nfcall(exec, 'dpkg -s ' + dependencies.join(' ')).then(null, (error) => {
            var package = error.message.match(/dpkg-query:\spackage\s\'([a-zA-Z0-9]+)\'/);
            if (package) {
                package = package[ 1 ];
                return $q.nfcall(exec, 'apt update').then(() => {
                    return $q.nfcall(exec, 'apt install -y ' + package);
                });

            }
            else throw error;
        });
};

module.exports.requires = [ 'controller' ];
