# angular-ticker

A simple service that is meant to facilitate repetitive tasks that run every X seconds.

## How to use

Step 1: Install the bower package

`bower install angular-ticker`
 
Step 2: Add the `jsbb.angularTicker` module as a dependency in you angular app module

`angular.module('MyApp', ['jsbb.angularTicker']);`
 
Step 3: Inject the `TickerSrv` into the relevant `Controller`, `Service` or `Directive` and use it

To register a task:

`TickerSrv.register('taskId', handlerFunction, interval, delay)` 

To unregister a task:

`TickerSrv.unregister('taskId');`

To unregister all tasks:

`TickerSrv.unregisterAll();`
