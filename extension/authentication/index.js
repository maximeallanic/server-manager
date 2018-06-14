/*
 * Copyright 2018 Allanic ISC License License
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 * Created by mallanic <maxime@allanic.me> at 05/06/2018
 */

const $lodash = require('lodash');
const $path = require('path');
const $q = require('q');
const $jwt = require('jsonwebtoken');

const cert = 'JzVq;_UWr{=_,/In0O6:&/f-,\'[ (wB; <P) E5E[ 4Gz5Ym ?>"sy7WsNLMW.3u-#,~';

module.exports = (app) => {
    const authController = $lodash.find(app.controllers, (controller) => {
        return $lodash.isFunction(controller.login);
    });

    app.post('/api/login', (req, res) => {
        authController.login(req.body.username, req.body.password).then((out) => {
            out.token = $jwt.sign(out, cert, {
                expiresIn: '1d'
            });
            res.send(out);
        }, (err) => {
            console.error(err);
            res.status(400).send(err);
        });
    });

    app.$on('routeHandle', (req, res) => {
        if (req.path.match(/^\/api\/(?!login).*/)) {
            const auth = req.headers[ 'authorization' ];
            if (!auth)
                throw new Error('No authorization header');
            return $q.nfcall($jwt.verify, auth, cert).then((decoded) => {
                req.user = decoded;
                return app.$emit('authentication.userLoaded', decoded);
            });
        }
    });

    app.$on('web-manager.beforeLoadAssets', (webManager) => {
        return webManager.add([
            $path.join(__dirname, 'web/', 'js/user.service.js.ejs'),
            $path.join(__dirname, 'web/', 'css/signin.css'),
            $path.join(__dirname, 'web/', 'login.html')
        ]);
    });
};

module.exports.requires = [ 'controller' ];
