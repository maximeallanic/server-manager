/*
 * Copyright 2018 Your Company ISC License License
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 * Created by mallanic <maxime@allanic.me> at 05/06/2018
 */
const $lodash = require('lodash');

module.exports = (app) => {
    const authController = $lodash.find(app.controllers, (controller) => {
        return $lodash.isFunction(controller.login);
    });

    app.post('/api/login', (req, res) => {
        authController.login(req.body.username, req.body.password).then((out) => {
            console.log(out);
            res.send();
        });
    });
};

module.exports.requires = [ 'controller' ];
