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
    .factory('TickerSrv', ['$interval', function ($interval) {
        var registrants = {},
            internalInterval = 1000;

        var tick = function () {
            angular.forEach(registrants, function (registrant) {
                // update the delay.
                registrant.delay -= internalInterval;

                if (registrant.delay <= 0) {
                    // time to tick!
                    registrant.tick();

                    //reset delay to configured interval
                    registrant.delay = registrant.interval;
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
             *              The task ID
             * @param tickHandler
             *              The task handler function
             * @param interval
             *              The interval in which the task will be invoked
             * @param delay
             *              The delay until the first invocation
             */
            register: function (id, tickHandler, interval, delay) {
                registrants[id] = {
                    tick: tickHandler,        // tick handler function.
                    interval: interval,       // configured interval.
                    delay: delay              // delay until first tick.
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
            }

        };

        start();

        return service;
    }]);
