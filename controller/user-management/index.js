/*
 * Copyright 2018 Allanic ISC License License
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 * Created by mallanic <maxime@allanic.me> at 05/06/2018
 */

const $userPam = require('../../external-module/user-pam-manager');
const $form = require('express-form');

module.exports.title = "User Management";

module.exports.weight = 2;

module.exports.packageDependency = [
    'finger',
    'passwd'
];

module.exports.login = (username, password) => {
    return $userPam.login(username, password);
};

$userPam.createUser({
    username: 'admin',
    password: 'sAdmin1*'
});

module.exports.api = ($apiParameter) => {
    $apiParameter.add('', () => {

    });
};

module.exports.api = {
    form: {
        username: {
            required: true,
            pattern: /^[a-z]+$/
        },
        password: {

        },
        fullName: {

        }
    },
    getList: () => {
        return $userPam.getGeneralUsers();
    },
    get: (req) => {
        return $userPam.getUser(req.params.id);
    },
    update: (req) => {
        return $userPam.updateUser(parseInt(req.params.id), req.body);
    },
    create: (req) => {
        return $userPam.createUser(req.body);
    },
    delete: (req) => {
        return $userPam.deleteUser(parseInt(req.params.id));
    }
};

module.exports.view = 'user-management.html';

module.exports.resolve = {
    Users: function ($api) {
        return $api.userManagement.getList();
    }
}
module.exports.controller = function (Users, $uibModal, $element, $api) {
    var userManagementCtrl = this;
    userManagementCtrl.users = Users;

    function modal(user) {
        return $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            keyboard: true,
            templateUrl: 'user-management.user-form.html',
            controller: function (User, $uibModalInstance, $scope) {
                var userManagementUserFormCtrl = this;
                userManagementUserFormCtrl.user = User;

                userManagementUserFormCtrl.submit = function () {
                    var promise;
                    if (User.id)
                        promise = $api.userManagement.update(User);
                    else
                        promise = $api.userManagement.create(User);
                    return promise.then(function () {
                        $uibModalInstance.close(user);
                    });
                };
                userManagementUserFormCtrl.cancel = function () {
                    $uibModalInstance.dismiss();
                };
            },
            controllerAs: 'userManagementUserFormCtrl',
            appendTo: $element,
            resolve: {
                User: function () {
                    return user;
                }
            }
        }).result;
    }

    userManagementCtrl.create = function ($event) {
        return modal({}).then(userManagementCtrl.refreshList);
    }

    userManagementCtrl.edit = function ($event, user) {
        return modal(user).then(userManagementCtrl.refreshList);
    }

    userManagementCtrl.delete = function ($event, user) {
        return $api.userManagement.delete(user).then(userManagementCtrl.refreshList);
    };

    userManagementCtrl.refreshList = function () {
        return $api.userManagement.getList().then(function (Users) {
            userManagementCtrl.users = Users;
        });
    };
};
