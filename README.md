# angular-ticker

A simple service that is meant to facilitate repetitive tasks that run every X ms.
The TickerSrv runs every 1000 ms.

Task invocation policy is determined per task.

* If the task is configured as `Blocking`, the `TimingSrv` will wait for the invocation to complete before 
resetting the interval<br> (interval is calculated from the moment the invocation is complete). 

* If the task is configured as `Non-Blocking`, the `TimingSrv` will not wait for the invocation to complete<br>
(interval is calculated from the moment the invocation is started). <br>
*Note, that in this scenario the next invocation might be invoked before the previous one has completed.*

For `Blocking` tasks, the `handlerFunction` is expected to return a promise that is resolved or rejected. <br>
For `Non-Blocking` tasks the return value is ignored.


## How to use

Step 1: Install the bower package

`bower install angular-ticker`
 
Step 2: Add the `jsbb.angularTicker` module as a dependency in you angular app module

`angular.module('MyApp', ['jsbb.angularTicker']);`
 
Step 3: Inject the `TickerSrv` into the relevant `Controller`, `Service` or `Directive` and use it

To register a task:

`TickerSrv.register('taskId', handlerFunction, interval, delay, isBlocking);` 

To unregister a task:

`TickerSrv.unregister('taskId');`

To unregister all tasks:

`TickerSrv.unregisterAll();`
