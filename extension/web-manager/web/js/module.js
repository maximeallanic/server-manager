/*
 * Copyright 2018 Your Company ISC License License
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 * Created by mallanic <maxime@allanic.me> at 05/06/2018
 */

angular.module('router', [
    'ui.bootstrap',
    'ui.router'
])
    .config(function ($stateProvider) {
        $stateProvider.state('router', {
            views: {
                'main': {
                    templateUrl: '/layout.html',
                    controllerAs: 'layoutCtrl',
                    controller: function () {
                    }
                }
            }
        });
        $stateProvider.state('login', {
            url: '/login',
            views: {
                'main': {
                    templateUrl: '/login.html',
                    controllerAs: 'loginCtrl',
                    controller: function () {
                    }
                }
            }


        });
    });
