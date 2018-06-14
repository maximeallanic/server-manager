/*
 * Copyright 2018 Allanic.me ISC License License
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 * Created by mallanic <maxime@allanic.me> at 14/06/2018
 */


module.exports.title = "Network";

module.exports.weight = 1;

module.exports.api = {
    getList: (req) => {
        return $q.resolve(req.app.config.getFields());
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

module.exports.view = 'parameter.html';

module.exports.resolve = {
    Parameter: function ($api) {
        return $api.parameter.getList();
    }
}
module.exports.controller = function (Parameter, $api) {
    var parameterCtrl = this;

    parameterCtrl.parameters = Parameter;

    parameterCtrl.update = function (key, value) {
        return $api.parameter.update({
            id: key,
            value: value
        });
    };
};
