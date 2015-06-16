/**
 * Created by sefi on 16/06/15.
 */

'use strict';

describe('tickerSrvProvider', function () {

    var tickerSrvProvider, tickerSrv, $interval, $q, handlers;

    beforeEach(module('jsbb.angularTicker', function(TickerSrvProvider) {
        tickerSrvProvider = TickerSrvProvider;
        tickerSrvProvider.setInterval(500);
    }));

    beforeEach(inject(function (TickerSrv, _$interval_, _$q_) {
        tickerSrv = TickerSrv;
        $interval = _$interval_;
        $q = _$q_;

        spyOn(tickerSrv, 'register').and.callThrough();
        spyOn(tickerSrv, 'unregister').and.callThrough();
        spyOn(tickerSrv, 'unregisterAll').and.callThrough();

        handlers = {
            handler: function () {
                var deferred = $q.defer();
                deferred.resolve();
                return deferred.promise;
            }
        };

        spyOn(handlers, 'handler').and.callThrough();
    }));

    describe('custom interval', function() {

        it('should use custom interval', function() {
            tickerSrv.register('task1', handlers.handler, 500, 0, false);
            expect(tickerSrvProvider.getInterval()).toBe(500);

            $interval.flush(1010);
            expect(handlers.handler.calls.count()).toEqual(2);
        });
    });


});
