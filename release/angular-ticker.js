'use strict';

/**
 * @ngdoc overview
 * @name jsbb.angularTicker
 * @description
 * # jsbb.angularTicker
 *
 * Main module of the application.
 */
angular.module('jsbb.angularTicker', []);
;/**
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
    .factory('TickerSrv', ['$interval', function ($interval) {
        var registrants = {},
            internalInterval = 1000;

        var resetRegistrantState = function (registrant) {
            registrant.delay = registrant.interval;
            registrant.isPending = false;
        };

        var handleBlockingTask = function (registrant) {
            if (!registrant.isPending) {
                registrant.isPending = true;
                registrant.tick().then(function () {
                    resetRegistrantState(registrant);
                }, function () {
                    resetRegistrantState(registrant);
                });
            }
        };

        var handleNonBlockingTask = function (registrant) {
            registrant.tick();
            resetRegistrantState(registrant);
        };

        var tick = function () {
            angular.forEach(registrants, function (registrant) {
                // update the delay.
                registrant.delay -= internalInterval;

                if (registrant.delay <= 0) {
                    // time to tick!
                    try {
                        if (registrant.isBlocking) {
                            handleBlockingTask(registrant);
                        } else {
                            handleNonBlockingTask(registrant);
                        }
                    } catch (e) {
                        console.log(e);
                        resetRegistrantState(registrant);
                    }
                }
            });
        };

        var start = function () {
            $interval(tick, internalInterval);      // schedule the interval to run the tick every internalInterval
            tick();                                 // start the first tick
        };

        var service = {

            /**
             *
             * Register a new task for the TickerSrv to invoke.
             *
             * @param id
             *              The task ID.
             * @param tickHandler
             *              The task handler function. This function should return a promise.
             * @param interval
             *              The interval (ms) in which the task will be invoked.
             *              Default: 1000
             * @param delay
             *              The delay (ms) until the first invocation.
             *              Default: 0
             * @param isBlocking
             *              Should we wait for the task invocation to complete before invoking it again.
             *              Default: true
             *
             */
            register: function (id, tickHandler, interval, delay, isBlocking) {

                if (interval === undefined) {
                    interval = 1000;
                }

                if (delay === undefined) {
                    delay = 0;
                }

                if (isBlocking === undefined) {
                    isBlocking = true;
                }

                registrants[id] = {
                    id: id,
                    tick: tickHandler,
                    interval: interval,
                    delay: delay,
                    isBlocking: isBlocking,
                    isPending: false             // is the task pending, i.e. waiting to the invocation to complete
                };
            },

            /**
             *
             * Unregister a registered task. It will stop being invoked.
             *
             * @param id
             *            The task ID
             */
            unregister: function (id) {
                delete registrants[id];
            },

            /**
             *
             * Unregisters ALL tasks in the tasks registry. A clean slate.
             *
             */
            unregisterAll: function () {
                registrants = {};
            }

        };

        start();

        return service;
    }]);
