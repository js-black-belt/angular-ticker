# angular-ticker

A service that is meant to facilitate repetitive tasks that run every X ms.  
The TickerSrv service runs every 1000 ms by default.

Task Invocation Policy is determined per task, and defaults to `Linear`.

* If the task is configured as `Linear`, the `TickerSrv` will wait for the invocation to complete before 
resetting the task interval (interval is calculated from the moment the invocation is complete).

* If the task is configured as `Parallel` (Non-Linear), the `TickerSrv` will not wait for the invocation to complete before resetting the task interval (interval is calculated from the moment the invocation is started).  
*Note, that in this scenario the next invocation might be invoked before the previous one has completed.*

For `Linear` tasks, The `handlerFunction` is expected to return a promise that is resolved or rejected.  
For `Parallel` tasks, the `handlerFunction` return value is ignored so returning a promise is not required. 

## Why use it?

You are probably asking yourself:  
> Why use it?  
> Why not just use $timeout/$interval?  

Well, the TickerSrv is much more than a simple interval ticker.  
#### The Benefits
* It is a centralized handling for repetitive tasks  
* It supports different interval and/or delay per task  
* It allows control over the Task Invocation Policy (parallel tasks vs. linear tasks) on a per task configuration  

#### Dependency Injection & Refactoring
From an architectural perspective, it is better to inject a service throughout the application and only inject $interval in the service implementation, so that if at some point in the future $interval will have to be replaced with some other facility, the refactoring effort will be minimal and limited to the service without any modifications to the rest of the code.

#### Solving Protractor Issue with timeouts
Polling the server with a self invoking $timeout breaks Protractor tests, since it prevents the page from ever fully load.  
Using the TickerSrv service eliminates the need to consider such issues. 

#### Auto Unregister tasks
The TickerSrv service exposes register and unregister methods on the $scope. When using the $scope API, the TickerSrv service detects when 
the $scope is being destroyed and auto unregisters the task, to prevent tasks from leaking.  
This frees you from having to unregister tasks manually.

## Configuration

You can configure the TickerSrv internal interval (defaults to 1000ms) by injecting its provider in the config phase:

```javascript
angular.module('jsbb.angularTicker', [])
    .config(function (TickerSrvProvider) {
        TickerSrvProvider.setInterval(500);
    });
```    

More configuration options will be added in the future.

## How to use

See Plunks here:
> http://plnkr.co/edit/jUljaNTXhm3LJ4gm209f - Shows basic usage of the two APIs.  
> http://plnkr.co/edit/htpGZuUrqqOFX5xzpHGF - Shows how to config the service provider

#### Step 1:  
Install the bower package  
`bower install angular-ticker`
 
#### Step 2:  
Add the `jsbb.angularTicker` module as a dependency in you angular app module  
```javascript
angular.module('MyApp', ['jsbb.angularTicker']);
```  

#### Step 3: 
Inject the `TickerSrv` service into the relevant `Controller`, `Service` or `Directive` and use it's API.

Alternately, you could use the API exposed on the $scope. Using this API eliminates the need to inject the TickerSrv service 
as well as provides the task autoUnregister functionality.

## API Methods  

#### Using the service API
To register a task:  
> If not provided, interval defaults to 1000, delay defaults to 0 & isLinear defaults to true  

```javascript
TickerSrv.register('taskId', handlerFunction, interval, delay, isLinear);
```

To unregister a task:  
```javascript
TickerSrv.unregister('taskId');
```

To unregister all tasks:  
```javascript
TickerSrv.unregisterAll();
```  

#### Using the $scope API
To register a task:
> If not provided, interval defaults to 1000, delay defaults to 0 & isLinear defaults to true  

```javascript
$scope.registerTickerTask('taskId', handlerFunction, interval, delay, isLinear);
```

To unregister a task:  
```javascript
$scope.unregisterTickerTask('taskId');
```

There is no point in exposing unregisterAll on the $scope. 

## A complete usage example
#### Using the service API

```javascript
angular.module('myModule', ['jsbb.angularTicker'])
    .config(function (TickerSrvProvider) {
        TickerSrvProvider.setInterval(500);
    })
    .controller('myCtrl', function(TickerSrv, $q, $http) {
        var linearHandler = function() {
            var deferred = $q.defer();

            // do something async and resolve or reject the deferred when done
            $http.get('someurl').
                success(function(data) {
                // do something with the data and resolve the deferred
                deferred.resolve();
                }).
                error(function(reason) {
                // do something with the error and reject the deferred
                deferred.reject();
                });

            return deferred.promise;
        };

        var parallelHandler = function() {
            // do something
        };

        // defaults to interval 1000, delay 0, linear Task Invocation Policy
        TickerSrv.register('linearTask', linearHandler);
        
        // specify custom interval / delay and specify the Task Invocation Policy as parallel
        TickerSrv.register('parallelTask', parallelHandler, 2000, 1000, false);
        
        // unregister a task
        TickerSrv.unregister('linearTask');
        
        // unregister all tasks
        TickerSrv.unregisterAll();
    });
```    

#### Using the $scope API

```javascript
angular.module('myModule', ['jsbb.angularTicker'])
    .config(function (TickerSrvProvider) {
        TickerSrvProvider.setInterval(500);
    })
    .controller('myCtrl', function($scope, $q, $http) {
        var linearHandler = function() {
            var deferred = $q.defer();

            // do something async and resolve or reject the deferred when done
            $http.get('someurl').
                success(function(data) {
                // do something with the data and resolve the deferred
                deferred.resolve();
                }).
                error(function(reason) {
                // do something with the error and reject the deferred
                deferred.reject();
                });

            return deferred.promise;
        };

        var parallelHandler = function() {
            // do something
        };

        // defaults to interval 1000, delay 0, linear Task Invocation Policy
        $scope.registerTickerTask('linearTask', linearHandler);
        
        // specify custom interval / delay and specify the Task Invocation Policy as parallel
        $scope.registerTickerTask('parallelTask', parallelHandler, 2000, 1000, false);
        
        // unregister a task
        $scope.unregisterTickerTask('linearTask');
        
    });
```    

## Version history

> 0.1.11
    Fix scope API support for ngTransclude

> 0.1.10  
    Add support for auto unregister for isolated scopes created from isolated scopes

> 0.1.9  
    Add support for auto unregister for isolated scopes

> 0.1.8  
    Add support for auto unregister
