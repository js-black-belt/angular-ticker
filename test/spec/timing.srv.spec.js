/**
 * Created by sefi on 15/06/15.
 */
'use strict';

describe('timing.srv', function () {

    var tickerSrv, $interval, handlers;

    beforeEach(module('jsbb.angularTicker'));
    beforeEach(inject(function (TickerSrv, _$interval_) {
        tickerSrv = TickerSrv;
        $interval = _$interval_;

        spyOn(tickerSrv, 'register').and.callThrough();
        spyOn(tickerSrv, 'unregister').and.callThrough();
        spyOn(tickerSrv, 'unregisterAll').and.callThrough();

        handlers = {
            handler: function () {
            },
            handler2: function () {
            }
        };

        spyOn(handlers, 'handler').and.callThrough();
        spyOn(handlers, 'handler2').and.callThrough();
    }));

    describe('sanity', function () {
        it('should make sure the service was injected', function () {
            expect(tickerSrv).toBeDefined();
        });

    });

    describe('single task', function () {
        it('should register a task and see it run with default interval & delay', function () {
            tickerSrv.register('task1', handlers.handler);

            $interval.flush(1010);

            expect(handlers.handler).toHaveBeenCalled();
            expect(handlers.handler.calls.count()).toEqual(1);
        });

        it('should register a task and see it run once with interval 1000 & delay 1001', function () {
            tickerSrv.register('task1', handlers.handler, 1000, 1001);

            $interval.flush(2010);

            expect(handlers.handler).toHaveBeenCalled();
            expect(handlers.handler.calls.count()).toEqual(1);
        });

        it('should register a task and see it run twice', function () {
            tickerSrv.register('task1', handlers.handler);

            $interval.flush(2010);

            expect(handlers.handler).toHaveBeenCalled();
            expect(handlers.handler.calls.count()).toEqual(2);
        });
    });

    describe('multiple tasks', function () {
        it('should register two tasks and see them run', function () {
            tickerSrv.register('task1', handlers.handler);
            tickerSrv.register('task2', handlers.handler2);

            $interval.flush(1010);

            expect(handlers.handler).toHaveBeenCalled();
            expect(handlers.handler.calls.count()).toEqual(1);
            expect(handlers.handler2).toHaveBeenCalled();
            expect(handlers.handler2.calls.count()).toEqual(1);
        });

        it('should register two tasks and see them run with different delay', function () {
            tickerSrv.register('task1', handlers.handler);
            tickerSrv.register('task2', handlers.handler2, 1000, 2001);

            $interval.flush(1001);

            expect(handlers.handler).toHaveBeenCalled();
            expect(handlers.handler.calls.count()).toEqual(1);
            expect(handlers.handler2).not.toHaveBeenCalled();

            $interval.flush(2010);

            expect(handlers.handler.calls.count()).toEqual(3);
            expect(handlers.handler2).toHaveBeenCalled();
            expect(handlers.handler2.calls.count()).toEqual(1);
        });
    });

    describe('unregister tasks', function() {
        it('should unregister tasks one by one', function() {
            tickerSrv.register('task1', handlers.handler);
            tickerSrv.register('task2', handlers.handler2, 1000, 2001);

            $interval.flush(1001);

            expect(handlers.handler).toHaveBeenCalled();
            expect(handlers.handler.calls.count()).toEqual(1);
            expect(handlers.handler2).not.toHaveBeenCalled();

            tickerSrv.unregister('task2');

            $interval.flush(1000);

            expect(handlers.handler.calls.count()).toEqual(2);
            expect(handlers.handler2).not.toHaveBeenCalled();

            tickerSrv.unregister('task1');

            $interval.flush(1000);

            expect(handlers.handler.calls.count()).toEqual(2);
            expect(handlers.handler2).not.toHaveBeenCalled();
        });

        it('should unregister all tasks', function() {
            tickerSrv.register('task1', handlers.handler);
            tickerSrv.register('task2', handlers.handler2, 1000, 2001);

            $interval.flush(1001);

            expect(handlers.handler).toHaveBeenCalled();
            expect(handlers.handler.calls.count()).toEqual(1);
            expect(handlers.handler2).not.toHaveBeenCalled();
            expect(tickerSrv.unregisterAll).not.toHaveBeenCalled();

            tickerSrv.unregisterAll();

            $interval.flush(1000);

            expect(handlers.handler.calls.count()).toEqual(1);
            expect(handlers.handler2).not.toHaveBeenCalled();
            expect(tickerSrv.unregisterAll).toHaveBeenCalled();

        });

    });
});
