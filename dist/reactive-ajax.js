/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(1);


/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isObj", function() { return isObj; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isArr", function() { return isArr; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isFunc", function() { return isFunc; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "eachKey", function() { return eachKey; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "poll", function() { return poll; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "filterObjectData", function() { return filterObjectData; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "filterArrayOfObjectsData", function() { return filterArrayOfObjectsData; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "pluckObjectDataToArray", function() { return pluckObjectDataToArray; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "pluckArrayOfObjectsDataToArray", function() { return pluckArrayOfObjectsDataToArray; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ajax", function() { return ajax; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "reactiveAjax", function() { return reactiveAjax; });
/**
 * Module: Reactive Ajax
 * Author: Neven Dyulgerov
 * version: 1.0.0
 * License: MIT
 * Description: Reactive ajax module for precise control over async requests
 */
/**
 * @description Check if value is of type 'object'
 * @param val
 * @returns {boolean}
 */
var isObj = function (val) {
    return typeof val === 'object' && !isArr(val) && !window.isNull(val);
};
/**
 * @description Check if value is of type 'array'
 * @param val
 * @returns {boolean}
 */
var isArr = function (val) { return Array.isArray(val); };
/**
 * @description Check if value is of type 'function'
 * @param val
 * @returns {boolean}
 */
var isFunc = function (val) { return typeof val === 'function'; };
/**
 * @description Iterate over each key of an object
 * @param obj
 * @param callback
 */
var eachKey = function (obj, callback) {
    Object.keys(obj).forEach(function (key, index) {
        return callback(key, obj[key], index);
    });
};
/**
 * @description Get ajax options
 * @param options
 */
var getAjaxOptions = function (options) {
    var ajaxOptions = {
        type: options.type || 'GET',
        url: options.url,
        dataType: options.dataType || 'JSON',
        headers: options.headers || {},
        data: options.data || {},
        success: function (res, textStatus, xhr) {
            options.callback(undefined, res);
        },
        error: function (xhr, text, err) {
            options.callback(err);
        },
        complete: function (xhr, textStatus) {
            if (isFunc(options.complete)) {
                options.complete();
            }
        }
    };
    return ajaxOptions;
};
/**
 * @description Poll over an interval of time
 * @param {{interval?: number}} options
 * @returns {(handler: (resolve: (proceed: boolean) => void) => void, complete: () => void) => void}
 */
var poll = function (options) {
    if (options === void 0) { options = {}; }
    var interval = options.interval || 0;
    var complete = isFunc(options.complete) ? options.complete : function () { return true; };
    return function (handler) {
        setTimeout(function () {
            handler(function (proceed) {
                if (proceed) {
                    return poll({ interval: interval, complete: complete })(handler);
                }
                complete();
            });
        }, interval);
    };
};
/**
 * @description Filter object data
 * @param objectData
 * @param requiredKeys
 */
var filterObjectData = function (objectData, requiredKeys) {
    var filteredObject = {};
    eachKey(objectData, function (key, value) {
        if (requiredKeys.indexOf(key) === -1) {
            return false;
        }
        filteredObject[key] = value;
    });
    return filteredObject;
};
/**
 * @description Filter array of objects data
 * @param arrayData
 * @param requiredKeys
 */
var filterArrayOfObjectsData = function (arrayData, requiredKeys) {
    return arrayData.reduce(function (accumulator, item) {
        var filteredObject = filterObjectData(item, requiredKeys);
        accumulator.push(filteredObject);
        return accumulator;
    }, []);
};
/**
 * @description Pluck object data to array
 * @param objectData
 * @param requiredKey
 */
var pluckObjectDataToArray = function (objectData, requiredKey) {
    var filteredArray = [];
    eachKey(objectData, function (key, value) {
        if (requiredKey !== key) {
            return false;
        }
        filteredArray.push(value);
    });
    return filteredArray;
};
/**
 * @description Pluck array of objects data to array
 * @param arrayData
 * @param requiredKey
 */
var pluckArrayOfObjectsDataToArray = function (arrayData, requiredKey) {
    return arrayData.reduce(function (accumulator, item) {
        var filteredArray = pluckObjectDataToArray(item, requiredKey);
        accumulator = accumulator.concat(filteredArray);
        return accumulator;
    }, []);
};
/**
 * @description Ajax handler
 * @param options
 */
var ajax = function (options) {
    var ajaxOptions = getAjaxOptions(options);
    return $.ajax(ajaxOptions);
};
/**
 * @description Reactive ajax
 * @param options
 */
var reactiveAjax = function (options) {
    var assign = Object.assign;
    var originalOptions = assign({}, options);
    var modifiedOptions = assign({}, originalOptions);
    var IsRequestFullfilled = false;
    var isRequestAborted = false;
    var request;
    /**
     * @description Normalize callback
     */
    var normalizeCallback = function () {
        modifiedOptions = assign(modifiedOptions, {
            callback: function (err, res) {
                var filteredData;
                if (isRequestAborted) {
                    return false;
                }
                IsRequestFullfilled = true;
                if (err) {
                    return options.callback(err);
                }
                originalOptions.callback(undefined, res);
            }
        });
    };
    normalizeCallback();
    return {
        /**
         * @@description Filter
         * @param filters
         */
        filter: function (filters) {
            options.callback = function (err, res) {
                var filteredData;
                if (isRequestAborted) {
                    return false;
                }
                IsRequestFullfilled = true;
                if (err) {
                    return options.callback(err);
                }
                if (isObj(res)) {
                    filteredData = filterObjectData(res, filters);
                }
                else if (isArr(res) && isObj(res[0])) {
                    filteredData = filterArrayOfObjectsData(res, filters);
                }
                originalOptions.callback(undefined, filteredData);
            };
            modifiedOptions = assign({}, options);
            return this;
        },
        /**
         * @description Pluck
         * @param filterKey
         */
        pluck: function (filterKey) {
            options.callback = function (err, res) {
                var filteredData;
                if (isRequestAborted) {
                    return false;
                }
                IsRequestFullfilled = true;
                if (err) {
                    return options.callback(err);
                }
                if (isObj(res)) {
                    filteredData = pluckObjectDataToArray(res, filterKey);
                }
                else if (isArr(res) && isObj(res[0])) {
                    filteredData = pluckArrayOfObjectsDataToArray(res, filterKey);
                }
                originalOptions.callback(undefined, filteredData);
            };
            modifiedOptions = assign({}, options);
            return this;
        },
        /**
         * @description Watch
         * @param handler
         * @param complete
         * @param interval
         */
        watch: function (handler, complete, interval) {
            if (complete === void 0) { complete = function (isRequestFullfilled) {
            }; }
            if (interval === void 0) { interval = 100; }
            var poller = poll({
                interval: interval,
                complete: function () { return complete(IsRequestFullfilled); }
            });
            poller(function (resolve) { return handler(resolve, IsRequestFullfilled, function abort() {
                if (IsRequestFullfilled) {
                    return false;
                }
                isRequestAborted = true;
                request.abort();
                resolve(false);
            }); });
            return this;
        },
        /**
         * @description Run
         */
        run: function () {
            request = ajax(modifiedOptions);
            return this;
        },
    };
};


/***/ })
/******/ ]);