/**
 * Created by sefi on 15/06/15.
 */
'use strict';

describe('tickerSrv', function () {

    var tickerSrv, $interval, $q, handlers, scope, isolatedScope;

    beforeEach(module('jsbb.angularTicker'));
    beforeEach(inject(function ($rootScope, TickerSrv, _$interval_, _$q_) {
        tickerSrv = TickerSrv;
        $interval = _$interval_;
        $q = _$q_;

        scope = $rootScope.$new();
        isolatedScope = $rootScope.$new(true);

        spyOn(tickerSrv, 'register').and.callThrough();
        spyOn(tickerSrv, 'unregister').and.callThrough();
        spyOn(tickerSrv, 'unregisterAll').and.callThrough();

        handlers = {
            handler: function () {
                var deferred = $q.defer();
                deferred.resolve();
                return deferred.promise;
            },
            handler2: function () {
                var deferred = $q.defer();
                deferred.resolve();
                return deferred.promise;
            },
            handler3: function () {
                var deferred = $q.defer();

                var f = function() {
                    deferred.resolve();
                };

                $interval(f, 2000);
                return deferred.promise;
            },
            handler4: function() {

            }
        };

        spyOn(handlers, 'handler').and.callThrough();
        spyOn(handlers, 'handler2').and.callThrough();
        spyOn(handlers, 'handler3').and.callThrough();
        spyOn(handlers, 'handler4').and.callThrough();

        scope.$digest();
        isolatedScope.$digest();
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
            expect(handlers.handler.calls.count()).toEqual(1);
        });

        it('should register a task and see it run once with interval 1000 & delay 1001', function () {
            tickerSrv.register('task1', handlers.handler, 1000, 1001);

            $interval.flush(2010);
            expect(handlers.handler.calls.count()).toEqual(1);
        });

        it('should register a task and see it run twice', function () {
            tickerSrv.register('task1', handlers.handler);

            $interval.flush(2010);
            expect(handlers.handler.calls.count()).toEqual(2);
        });
    });

    describe('multiple tasks', function () {
        it('should register two tasks and see them run', function () {
            tickerSrv.register('task1', handlers.handler);
            tickerSrv.register('task2', handlers.handler2);

            $interval.flush(1010);
            expect(handlers.handler.calls.count()).toEqual(1);
            expect(handlers.handler2.calls.count()).toEqual(1);
        });

        it('should register two tasks and see them run with different delay', function () {
            tickerSrv.register('task1', handlers.handler);
            tickerSrv.register('task2', handlers.handler2, 1000, 2001);

            $interval.flush(1001);
            expect(handlers.handler.calls.count()).toEqual(1);
            expect(handlers.handler2).not.toHaveBeenCalled();

            $interval.flush(2010);
            expect(handlers.handler.calls.count()).toEqual(3);
            expect(handlers.handler2.calls.count()).toEqual(1);
        });
    });

    describe('unregister tasks', function () {
        it('should unregister tasks one by one', function () {
            tickerSrv.register('task1', handlers.handler);
            tickerSrv.register('task2', handlers.handler2, 1000, 2001);

            $interval.flush(1001);
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

        it('should unregister all tasks', function () {
            tickerSrv.register('task1', handlers.handler);
            tickerSrv.register('task2', handlers.handler2, 1000, 2001);

            $interval.flush(1001);
            expect(handlers.handler.calls.count()).toEqual(1);
            expect(handlers.handler2).not.toHaveBeenCalled();

            tickerSrv.unregisterAll();

            $interval.flush(1000);
            expect(handlers.handler.calls.count()).toEqual(1);
            expect(handlers.handler2).not.toHaveBeenCalled();

        });

    });

    describe('long tasks', function () {
        it('should verify a long blocking task handler does not delay other tasks', function () {
            tickerSrv.register('task2', handlers.handler3);
            tickerSrv.register('task1', handlers.handler);
            tickerSrv.register('task3', handlers.handler);
            tickerSrv.register('task4', handlers.handler);

            $interval.flush(2001);
            expect(handlers.handler.calls.count()).toEqual(6);
            expect(handlers.handler3.calls.count()).toEqual(1);

            $interval.flush(1001);
            expect(handlers.handler.calls.count()).toEqual(9);

            $interval.flush(2001);
            expect(handlers.handler3.calls.count()).toEqual(2);
            expect(handlers.handler.calls.count()).toEqual(15);

        });

        it('should verify a long non-blocking task handler does not delay other tasks', function () {
            tickerSrv.register('task2', handlers.handler3, 1000, 0, false);
            tickerSrv.register('task1', handlers.handler);
            tickerSrv.register('task3', handlers.handler);
            tickerSrv.register('task4', handlers.handler4, 1000, 0, false);

            $interval.flush(2001);
            expect(handlers.handler.calls.count()).toEqual(4);
            expect(handlers.handler3.calls.count()).toEqual(2);
            expect(handlers.handler4.calls.count()).toEqual(2);

            $interval.flush(1001);
            expect(handlers.handler.calls.count()).toEqual(6);
            expect(handlers.handler4.calls.count()).toEqual(3);

            $interval.flush(2001);
            expect(handlers.handler3.calls.count()).toEqual(5);
            expect(handlers.handler.calls.count()).toEqual(10);
            expect(handlers.handler4.calls.count()).toEqual(5);

        });

        it('should allow parallel tasks handler to not return a promise', function() {
            tickerSrv.register('task4', handlers.handler4, 1000, 0, false);

            $interval.flush(2001);
            expect(handlers.handler4.calls.count()).toEqual(2);
        });

        it('should expect linear tasks handler to return a promise', function() {
            tickerSrv.register('task4', handlers.handler, 1000, 0, true);
            tickerSrv.register('task5', handlers.handler);

            $interval.flush(2001);
            expect(handlers.handler.calls.count()).toEqual(4);
        });

    });

    describe('scope operations', function() {
        it('verify scope is configured', function() {
            expect(scope.registerTickerTask).toBeDefined();
            expect(scope.unregisterTickerTask).toBeDefined();

            expect(isolatedScope.registerTickerTask).toBeDefined();
            expect(isolatedScope.unregisterTickerTask).toBeDefined();
        });

        it('should use scope for registration', function() {
            scope.registerTickerTask('task1', handlers.handler);
            isolatedScope.registerTickerTask('task2', handlers.handler);

            $interval.flush(2001);
            expect(handlers.handler.calls.count()).toEqual(4);
        });

        it('should use scope for unregistration', function() {
            scope.registerTickerTask('task1', handlers.handler);
            isolatedScope.registerTickerTask('task2', handlers.handler);

            $interval.flush(2001);
            expect(handlers.handler.calls.count()).toEqual(4);

            scope.unregisterTickerTask('task1');
            isolatedScope.unregisterTickerTask('task2');

            $interval.flush(2001);
            expect(handlers.handler.calls.count()).toEqual(4);
        });

        it('should stop ticking on scope destroy', function() {
            scope.registerTickerTask('task1', handlers.handler);
            isolatedScope.registerTickerTask('task2', handlers.handler);

            $interval.flush(2001);
            expect(handlers.handler.calls.count()).toEqual(4);

            scope.$destroy();
            isolatedScope.$destroy();

            $interval.flush(2001);
            expect(handlers.handler.calls.count()).toEqual(4);

            $interval.flush(2001);
            expect(handlers.handler.calls.count()).toEqual(4);
        });

        it('should test scope inheritance', function() {
            expect(scope.$new).toBeDefined();
            expect(scope.registerTickerTask).toBeDefined();
            expect(isolatedScope.$new).toBeDefined();
            expect(isolatedScope.registerTickerTask).toBeDefined();

            // new scope from scope
            expect(scope.$new().registerTickerTask).toBeDefined();

            // new isolated scope from scope
            expect(scope.$new(true).registerTickerTask).toBeDefined();

            // new scope from isolated scope
            expect(isolatedScope.$new().registerTickerTask).toBeDefined();

            // new isolated scope from isolated scope
            expect(isolatedScope.$new(true).registerTickerTask).toBeDefined();
        });
    });

});
