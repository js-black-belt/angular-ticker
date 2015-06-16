# angular-ticker

A service that is meant to facilitate repetitive tasks that run every X ms.
The TickerSrv runs every 1000 ms by default.

Task Invocation Policy is determined per task, and defaults to `Linear`.

* If the task is configured as `Linear`, the `TickerSrv` will wait for the invocation to complete before 
resetting the interval (interval is calculated from the moment the invocation is complete). 

* If the task is configured as `Parallel` (Non-Linear), the `TickerSrv` will not wait for the invocation to complete 
(interval is calculated from the moment the invocation is started). <br>
*Note, that in this scenario the next invocation might be invoked before the previous one has completed.*

The `handlerFunction` is expected to return a promise that is resolved or rejected.

## Why use it?

The first question you might ask yourself is "Why use it? Why not just use $timeout/$interval?"

Well, my answer is that it goes way over a simple interval ticker.

* It is a centralized handling for repetitive tasks
 
* It supports different interval and/or delay per task

* It allows control over the Task Invocation Policy (parallel tasks vs. linear tasks) on a per task configuration

Besides all of the above, I prefer to inject a service throughout the application and only inject $interval in the service, so
that if I'll decide to use $timeout or some other facility in the future, the refactoring effort will be minimal and limited to the 
TickerSrv without any modifications to any of the other code.

## Configuration

The service is implemented as a provider. You can configure it's internal interval (defaults to 1000ms):

```javascript
angular.module('jsbb.angularTicker', [])
    .config(function (TickerSrvProvider) {
        TickerSrvProvider.setInterval(500);
    });
```    

More configuration options will be added in the future.

## How to use

Step 1: Install the bower package

`bower install angular-ticker`
 
Step 2: Add the `jsbb.angularTicker` module as a dependency in you angular app module

`angular.module('MyApp', ['jsbb.angularTicker']);`
 
Step 3: Inject the `TickerSrv` into the relevant `Controller`, `Service` or `Directive` and use it

To register a task:

`TickerSrv.register('taskId', handlerFunction, interval, delay, isLinear);` 

To unregister a task:

`TickerSrv.unregister('taskId');`

To unregister all tasks:

`TickerSrv.unregisterAll();`


### A complete usage example

```javascript
angular.module('jsbb.angularTicker', [])
    .config(function (TickerSrvProvider) {
        TickerSrvProvider.setInterval(500);
    })
    .controller('myCtrl', function(TickerSrv, $q, $timeout) {
        var linearHandler = function() {
            var deferred = $q.defer();

            // do something async and resolve the deferred when done
            var f = function() {
                deferred.resolve();
            };

            $timeout(f, 2000);
            return deferred.promise;
        };

        var parallelHandler = function() {
            var deferred = $q.defer();
            // do something
            deferred.resolve();
            return deferred.promise;
            
        };

        // defaults to interval 1000, delay 0, linear Task Invocation Policy
        TickerSrv.register('linearTask', linearHandler());
        
        // specify custom interval / delay and specify the Task Invocation Policy as parallel
        TickerSrv.register('parallelTask', parallelHandler(), 2000, 1000, false);
        
        // unregister a task
        TickerSrv.unregister('linearTask');
        
        // unregister all tasks
        TickerSrv.unregisterAll();
    });
```    
