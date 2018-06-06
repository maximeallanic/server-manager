/*
 * Copyright 2018 Your Company ISC License License
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 * Created by mallanic <maxime@allanic.me> at 05/06/2018
 */

const $userPam = require('../../external-module/user-pam-manager');

module.exports.title = "User Management";

module.exports.packageDependency = [
    'finger',
    'passwd'
];

module.exports.login = (username, password) => {
    return $userPam.login(username, password);
};

module.exports.api = {
    getList: () => {
        return $userPam.getGeneralUsers();
    },
    get: (req) => {
        return $userPam.getUser(req.params.id);
    },
    update: () => {
        return $userPam.updateUser(parseInt(req.params.id), req.body);
    },
    create: (req) => {
        return $userPam.createUser(req.body);
    },
    delete: (req) => {
        return $userPam.deleteUser(parseInt(req.params.id));
    }
};

module.exports.view = 'view.html';
