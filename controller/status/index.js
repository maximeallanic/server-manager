/*
 * Copyright 2018 Allanic.me ISC License License
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 * Created by mallanic <maxime@allanic.me> at 14/06/2018
 */

const $network = require('network');
const $q = require('q');

module.exports.title = "Status";

module.exports.weight = 0;

module.exports.api = {
    getList: (req) => {
        return $q.nfcall($network.get_interfaces_list);
    },
    update: (req) => {
        return $q.resolve(req.app.config.set(req.params.id, req.body.value));
    }
};

module.exports.apiService = {
    getList: (req) => {
        return request({});
    },
    update: (req) => {
        return $q.resolve(req.app.config.set(req.body.key, req.body.value));
    }
};

module.exports.view = 'status.html';

module.exports.resolve = {
    Interfaces: function ($api) {
        return $api.status.getList();
    }
}
module.exports.controller = function (Interfaces, $api) {
    var statusCtrl = this;

    statusCtrl.interfaces = Interfaces;
};
