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
        var registrants = {},
            internalInterval = 1000;

        this.setInterval = function (value) {
            if (!angular.isNumber(value)) {
                throw new Error('TickerSrv: expected interval to be numeric, got ' + value);
            }

            internalInterval = value;
        };

        this.getInterval = function() {
            return internalInterval;
        };

        function TickerSrv($interval) {
            var resetRegistrantState = function (registrant) {
                registrant.delay = registrant.interval;
                registrant.isPending = false;
            };

            var handleLinearTask = function (registrant) {
                if (!registrant.isPending) {
                    registrant.isPending = true;
                    registrant.tick().then(function () {
                        resetRegistrantState(registrant);
                    }, function () {
                        resetRegistrantState(registrant);
                    });
                }
            };

            var handleParallelTask = function (registrant) {
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
                            if (registrant.isLinear) {
                                handleLinearTask(registrant);
                            } else {
                                handleParallelTask(registrant);
                            }
                        } catch (e) {
                            resetRegistrantState(registrant);
                            throw e;
                        }
                    }
                });
            };

            var start = function () {
                $interval(tick, internalInterval);      // schedule the interval to run the tick every internalInterval
                tick();                                 // start the first tick
            };


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
             * @param isLinear
             *              Should we wait for the task invocation to complete before invoking it again.
             *              Default: true
             *
             */
            this.register = function (id, tickHandler, interval, delay, isLinear) {

                if (interval === undefined) {
                    interval = 1000;
                }

                if (delay === undefined) {
                    delay = 0;
                }

                if (isLinear === undefined) {
                    isLinear = true;
                }

                registrants[id] = {
                    id: id,
                    tick: tickHandler,
                    interval: interval,
                    delay: delay,
                    isLinear: isLinear,
                    isPending: false             // is the task pending, i.e. waiting to the invocation to complete
                };
            };

            /**
             *
             * Unregister a registered task. It will stop being invoked.
             *
             * @param id
             *            The task ID
             */
            this.unregister = function (id) {
                delete registrants[id];
            };

            /**
             *
             * Unregisters ALL tasks in the tasks registry. A clean slate.
             *
             */
            this.unregisterAll = function () {
                registrants = {};
            };

            start();
        }

        this.$get = function ($interval) {
            return new TickerSrv($interval);
        };

    });
