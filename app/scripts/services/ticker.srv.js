'use strict';

/**
 * @ngdoc overview
 * @name jsbb.angularTicker
 * @description
 * # jsbb.angularTicker
 *
 * Main module of the application.
 */
angular.module('jsbb.angularTicker', [])
    .run(["$rootScope", "TickerSrv", function ($rootScope, TickerSrv) {
        // add the register task to the rootScope. This will allow for autoUnregister when the
        // scope is destroyed to prevent tasks from leaking.
        $rootScope.registerTickerTask = function (id, tickHandler, interval, delay, isLinear) {
            TickerSrv.register(id, tickHandler, interval, delay, isLinear);

            this.$on("$destroy", function () {
                TickerSrv.unregister(id);
            });
        };

        $rootScope.unregisterTickerTask = TickerSrv.unregister;
    }]);
/**
 * Created by sefi on 5/13/14.
 *
 * related post:
 * http://ajsblackbelt.wordpress.com/2014/05/13/timing-service/
 *
 * Free to use and abuse.
 * If you modify jsBlackBelt code, please let me know or submit a pull request for the benefit of others.
 */

'use strict';

angular.module('jsbb.angularTicker')
    .provider('TickerSrv', function () {
        var internalInterval = 1000;

        this.setInterval = function (value) {
            if (!angular.isNumber(value)) {
                throw new Error('TickerSrv: expected interval to be numeric, got ' + value);
            }

            internalInterval = value;
        };

        this.getInterval = function () {
            return internalInterval;
        };

        var TickerSrv = function ($interval, $q) {

            var tasks = {};
            /**
             *
             * Register a new task for the TickerSrv to invoke.
             *
             * @param id
             *              The task ID.
             * @param tickHandler
             *              The task handler function. This function could return a promise.
             * @param interval
             *              The interval (ms) in which the task will be invoked.
             *              Default: 1000
             * @param delay
             *              The delay (ms) until the first invocation.
             *              Default: 0
             * @param isLinear (DEPRECATED)
             *              Should we wait for the task invocation to complete before invoking it again.
             *              Default: true
             *
             */
            this.register = function (id, tickHandler, interval, delay, isLinear) {
                tasks[id] = (function (interval, delay) {
                    var ts = Date.now() + delay, resolved = !0;
                    return function () {
                        ((Date.now() - ts) / interval) > 1 && resolved && (function () {
                            resolved = !!0;
                            (function (def) {
                                var res = function () {
                                    resolved = !0;
                                    ts = Date.now();
                                };
                                def.resolve();
                                def
                                    .promise
                                    .then(tickHandler)
                                    .then(res, function (e) {
                                        res();
                                        throw(e);
                                    });
                            })($q.defer());
                        })();
                    };
                })(interval || 1000, delay || 0);
            };

            /**
             *
             * Unregister a registered task. It will stop being invoked.
             *
             * @param id
             *            The task ID
             */
            this.unregister = function (id) {
                delete tasks[id];
            };

            /**
             *
             * Unregisters ALL tasks in the tasks registry. A clean slate.
             *
             */
            this.unregisterAll = function () {
                tasks = {};
            };

            $interval(function () {
                Object.keys(tasks).forEach(function (key) {
                    tasks[key].call();
                });
            }, internalInterval);
        };

        this.$get = ["$interval", "$q", function ($interval, $q) {
            return new TickerSrv($interval, $q);
        }];

    });