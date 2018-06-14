/*
 * Copyright 2018 Allanic ISC License License
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 * Created by mallanic <maxime@allanic.me> at 05/06/2018
 */

angular.module('router', [
    'ui.bootstrap',
    'ui.router',
    'ngStorage',
    'ngAnimate',
    'ngMessages',
    'router.core'
])
    .config(function ($stateProvider, $locationProvider) {
        $stateProvider.state('router', {
            views: {
                'main': {
                    templateUrl: '/view/layout.html',
                    controllerAs: 'layoutCtrl',
                    controller: function ($toolbar) {
                        var layoutCtrl = this;
                        layoutCtrl.toolbar = $toolbar;
                    }
                }
            }
        });

        $locationProvider.html5Mode(true);
    });
