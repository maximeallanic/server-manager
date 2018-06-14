/*
 * Copyright 2017 Elkya <https://elkya.com/>
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 * Created by mallanic at 30/8/2017
 *
 */


angular.module('router.core')
    .config(function ($provide) {
        $provide.decorator('ngSubmitDirective', function ($delegate, $log, $q) {
            var ngSubmit = $delegate[ 0 ];
            ngSubmit.require = 'form';
            ngSubmit.compile = function () {
                return {
                    pre: function ($scope, $element, $attrs, $formController) {
                        $formController.$pending = null;
                        $formController.$submit = function ($event) {
                            $formController.$pending = $scope.$eval($attrs.ngSubmit, {
                                $event: $event
                            });

                            $formController.$$element.addClass('ng-form-pending');

                            $formController.$pending.then(function () {
                                $formController.$$element.removeClass('ng-form-pending');
                                $formController.$pending = null;
                            }, function (error) {
                                $formController.$$element.removeClass('ng-form-pending');
                                $formController.$pending = null;
                            });
                            return $formController.$pending;
                        };
                    },
                    post: function ($scope, $element, $attrs, $formController) {
                        $element.unbind('submit');

                        $element.submit($formController.$submit);
                    }
                };
            };

            return $delegate;
        });
    });
 /*
(function () {
    'use strict';


    angular
            .module('router.core')
            .provider('$ngForm', NgFormProvider)
            .config(FormDecorator);

    function NgFormProvider() {
        var $ngFormProvider = this;

        var errorParser = function (error) {
            return error;
        };

        /**
         * Parse error from server to link to model name
         * {
         *  form: [],
         *  models: {
         *      name: []
         *  }
         * }
         * @param {Function} fn
         *
        $ngFormProvider.setErrorParser = function (fn) {
            errorParser = fn;
        };

        $ngFormProvider.$get = function () {
            var $ngForm = this;

            $ngForm.parseError = errorParser;

            return $ngForm;
        };

        return $ngFormProvider;
    }

    /*eslint angular/no-private-call: "off"*/

    /** @ngInject *
    function FormDecorator($provide) {
        function declareFormController(controller) {
            /** @ngInject *
            var newController = function FormController($element, $attrs, $scope, $injector) {
                var $formController = this;

                $injector.invoke(controller, $formController, {
                    '$scope': $scope,
                    '$element': $element,
                    '$attrs': $attrs
                });

                $formController.$changed = false;
                $formController.$readOnly = false;
                $formController.$disabled = false;
                $formController.$viewChangeListeners = [];

                var $eachControls = function (fn) {
                    return _.each($formController.$$controls, fn);
                };

                $formController.$id = _.uniqueId();

                $formController.$reset = function () {
                    $eachControls(function (control) {
                        control.$reset();
                    });
                    $formController.$setPristine();
                };

                $formController.$setReadOnly = function (bool) {
                    $formController.$readOnly = _.isUndefined(bool) ? true : bool;
                    $eachControls(function (control) {
                        control.$setReadOnly(bool);
                    });
                };

                $formController.$setDisabled = function (bool) {
                    $formController.$disabled = _.isUndefined(bool) ? true : bool;
                    $eachControls(function (control) {
                        control.$setDisabled($formController.$disabled);
                    });
                };

                $formController.$setChanged = function (bool) {
                    $formController.$changed = _.isUndefined(bool) ? true : bool;
                    _.each($formController.$viewChangeListeners, function (viewChangeListener) {
                        viewChangeListener();
                    });
                };

                $formController.$setError = function (errors) {
                    if (_.isArray(errors.form)
                        && errors.form.length > 0)
                        _.each(errors.form, function (error) {
                            $formController.$setValidity(error, false);
                        });

                    _.each(errors.models, function (value, key) {
                        $formController[key].$setError(value);
                    });
                };

                $formController.$newSubController = function (name) {
                    function EmptyClass() {}
                    EmptyClass.prototype = newController.prototype;
                    var subController = new EmptyClass();
                    $injector.invoke(newController, subController, {
                        $scope: $scope,
                        $element: $element,
                        $attrs: $attrs
                    });

                    subController.$$renameControl(subController, name);
                    $formController.$addControl(subController);
                };

                var addControl = $formController.$addControl;

                $formController.$addControl = function (control) {

                    if (!_.isNil($attrs.ngFormAddControlToParent)
                            && control.$$parentForm) {
                        control.$$parentForm.$addControl(control);
                        return ;
                    }

                    if (control.$name.indexOf('.') >= 0) {
                        var path = _.toPath(control.$name);
                        var controllerName = _.head(path);
                        if (!$formController[controllerName])
                            $formController.$newSubController(controllerName);

                        var sControllerName =_.fromPath(_.drop(path));
                        if (control.$$attr)
                            control.$$attr.name = sControllerName;
                        control.$name = sControllerName;
                        $formController[controllerName].$addControl(control);

                        return ;
                    }


                    addControl.call($formController, control);

                    control.$setDisabled($formController.$disabled);
                    control.$setReadOnly($formController.$readOnly);

                    control.$viewChangeListeners.push(function () {

                        var apply = {
                            base: this,
                            arguments: arguments
                        };

                        $formController.$changed = _.some($formController.$$controls, '$changed');

                        _.each($formController.$viewChangeListeners, function (viewChangeListener) {
                            viewChangeListener.apply(apply.base, apply.arguments);
                        });
                    });


                };

                if (!_.isEmpty($attrs.ngDisabled))
                    $scope.$watch($attrs.ngDisabled, $formController.$setDisabled);

                if (!_.isEmpty($attrs.ngReadonly))
                    $scope.$watch($attrs.ngReadonly, $formController.$setReadOnly);

                $formController.$viewChangeListeners.unshift(function () {
                    _.each($formController.$error, function (control, error) {
                        if (_.isEmpty(_.compact(control)))
                            $formController.$setValidity(error, true);
                    });
                });
            };
            newController.prototype = controller.prototype;
            return newController;
        }


        $provide.decorator('formDirective', function ($delegate) {
            var form = $delegate[0];

            form.controller = declareFormController(form.controller);

            return $delegate;
        });

        $provide.decorator('ngFormDirective', function ($delegate) {
            var form = $delegate[0];

            form.controller = declareFormController(form.controller);

            return $delegate;
        });

        $provide.decorator('ngModelDirective', function ($delegate) {
            var ngModel = $delegate[0], controller = ngModel.controller;

            /** @ngInject *
            ngModel.controller = function ($scope, $element, $attrs, $injector) {
                var $ngModelController = this;

                $injector.invoke(controller, $ngModelController, {
                    '$scope': $scope,
                    '$element': $element,
                    '$attrs': $attrs
                });

                $ngModelController.$changed = false;
                $ngModelController.$disabled = false;
                $ngModelController.$readOnly = false;

                $ngModelController.$id = _.uniqueId();

                $ngModelController.$reset = function () {
                    $ngModelController.$setViewValue($ngModelController.$originalViewValue, 'debounce');
                };

                $ngModelController.$setReadOnly = function (bool) {
                    $ngModelController.$readOnly = _.isUndefined(bool) ? true : bool;
                    $attrs.$set('readonly', $ngModelController.$readOnly);
                };

                var listener;
                $ngModelController.$setDisabled = function (bool) {
                    bool = _.isUndefined(bool) ? true : bool;

                    if ($ngModelController.$disabled === bool)
                        return;

                    $ngModelController.$disabled = bool;

                    if ($ngModelController.$disabled) {
                        // Force disable when a directive set, with scope, this attribute every digest
                        listener = $attrs.$observe('disabled', function (value) {
                            if (!value)
                                $attrs.$set('disabled', 'disabled');
                        });
                        $attrs.$set('disabled', 'disabled');
                    }
                    else {
                        // Clear attribute listener
                        if (listener) {
                            listener();
                            listener = undefined;
                        }
                        var defaultValue = false;
                        if ($attrs.ngDisabled)
                            defaultValue = $scope.$eval($attrs.ngDisabled) ? 'disabled' : false;

                        $attrs.$set('disabled', defaultValue);
                    }
                };

                $ngModelController.$setChanged = function (bool) {
                    $ngModelController.$changed = _.isUndefined(bool) ? true : bool;
                };

                $ngModelController.$setFocus = function () {
                    $element.focus();
                };

                var $viewErrors = [];
                $ngModelController.$setError = function (error) {
                    if (_.isArray(error)) {
                        _.each(error, $ngModelController.$setError);
                        return $ngModelController;
                    }

                    $viewErrors.push({
                        viewValue: $ngModelController.$viewValue,
                        error: error
                    });
                    $ngModelController.$setValidity(error, false);
                };

                // Initialize originalViewValue
                $ngModelController.$formatters.unshift(function (viewValue) {
                    if (!$ngModelController.hasOwnProperty('$originalViewValue'))
                        $ngModelController.$originalViewValue = _.clone(viewValue);
                    return viewValue;
                });

                $ngModelController.$viewChangeListeners.unshift(function () {
                    _.each($viewErrors, function (error) {
                        $ngModelController.$setValidity(error.error,
                                !_.isEqualWith(error.viewValue, $ngModelController.$viewValue, $ngModelController.$equality));

                    });
                    $ngModelController.$changed = !_.isEqualWith($ngModelController.$originalViewValue, $ngModelController.$viewValue, $ngModelController.$equality);
                });
            };
            ngModel.controller.prototype = controller.prototype;

            return $delegate;
        });

        $provide.decorator('ngSubmitDirective', function ($delegate, $log, $ngForm) {
            var ngSubmit = $delegate[0];
            ngSubmit.require = 'form';
            ngSubmit.compile = function () {
                return {
                    pre: function ($scope, $element, $attrs, $formController) {
                        var onSubmitted = [];
                        $formController.$onSubmitted = function (fn) {
                            onSubmitted.push(fn);
                            return $formController;
                        };

                        if ($attrs.ngSubmitted)
                            $formController.$onSubmitted(function () {
                                return $scope.$eval($attrs.ngSubmitted);
                            });

                        $formController.$submit = function ($event) {
                            var promise = $scope.$eval($attrs.ngSubmit, {
                                $event: $event
                            });
                            _.set($scope, $attrs.ngSubmitPromise, promise);
                            promise.then(function () {
                                _.each(onSubmitted, function (fn) {
                                    fn();
                                });
                                $formController.$setSubmitted();
                            }, function (error) {
                                if (_.isError(error))
                                    $formController.$setError({
                                        form: [error.message]
                                    });
                                else
                                    try {
                                        error = $ngForm.parseError(error);
                                        $formController.$setError(error);
                                        $formController.$setSubmitted();
                                    } catch (e) {
                                        $log.error(e);
                                    }
                            });
                            return promise;
                        };
                    },
                    post: function ($scope, $element, $attrs, $formController) {
                        $element.unbind('submit');

                        $element.submit($formController.$submit);
                    }
                };
            };

            return $delegate;
        });
    }
})();*/
