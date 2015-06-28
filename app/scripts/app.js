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
    .run(function($rootScope, TickerSrv) {
        // add the register task to the rootScope. This will allow for autoUnregister when the
        // scope is destroyed to prevent tasks from leaking.
        $rootScope.registerTickerTask = function(id, tickHandler, interval, delay, isLinear) {
            TickerSrv.register(id, tickHandler, interval, delay, isLinear);

            this.$on('$destroy', function() {
                TickerSrv.unregister(id);
            });
        };

        $rootScope.unregisterTickerTask = TickerSrv.unregister;

        // since isolated scopes do not inherit prototypically from rootScope, we need to override $new
        // and add the functionality manually.
        $rootScope.$origNew = $rootScope.$new;

        $rootScope.$new = function(isolate, parent) {
            var newScope = this.$origNew(isolate, parent);

            if (isolate) {
                newScope.unregisterTickerTask = $rootScope.unregisterTickerTask;
                newScope.registerTickerTask = $rootScope.registerTickerTask;
            }

            return newScope;
        };
    });
