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

        $rootScope.origNew = $rootScope.$new;

        $rootScope.$new = function(isolate, parent ){

            var newScope = this.origNew(isolate, parent );

            if ( isolate ){
                newScope.unregisterTickerTask = TickerSrv.unregister;
                newScope.registerTickerTask = $rootScope.registerTickerTask;
            }
            return newScope;

        };

        $rootScope.unregisterTickerTask = TickerSrv.unregister;
    });
