/**
 * Module: Reactive Ajax
 * Author: Neven Dyulgerov
 * version: 1.0.0
 * License: MIT
 * Description: Reactive ajax module for precise control over async requests
 */

// ajax callback type
type AjaxCallback = (err: any, res?: any) => void;

// ajax options interface
interface IAjaxOptions {
  type ?: string;
  url: string;
  dataType?: 'JSON';
  data?: any;
  headers?: {
    [key: string]: string
  };
  callback: AjaxCallback;
  complete?: () => void;
}

/**
 * @description Check if value is of type 'object'
 * @param val
 * @returns {boolean}
 */
const isObj = (val: any) =>
  typeof val === 'object' && !isArr(val) && !isNull(val);

/**
 * @description Check if value is of type 'array'
 * @param val
 * @returns {boolean}
 */
const isArr = (val: any) => Array.isArray(val);

/**
 * @description Check if value is of type 'function'
 * @param val
 * @returns {boolean}
 */
const isFunc = (val: any) => typeof val === 'function';

/**
 * @description Check if value is of type 'null'
 * @param val
 * @returns {boolean}
 */
const isNull = (val: any) => val === null;

/**
 * @description Iterate over each key of an object
 * @param obj
 * @param callback
 */
const eachKey = (obj: any, callback: (key: string, prop?: any, index?: number) => void) => {
  Object.keys(obj).forEach((key: string, index: number) =>
    callback(key, (obj as any)[key], index));
};

/**
 * @description Get ajax options
 * @param options
 */
const getAjaxOptions = (options: IAjaxOptions) => {
  const ajaxOptions = {
    type: options.type || 'GET',
    url: options.url,
    dataType: options.dataType || 'JSON',
    headers: options.headers || {},
    data: options.data || {},
    success(res: any, textStatus: string, xhr: JQueryXHR) {
      options.callback(undefined, res);
    },
    error(xhr: JQueryXHR, text: string, err: string) {
      options.callback(err);
    },
    complete(xhr: JQueryXHR, textStatus: string) {
      if (isFunc(options.complete)) {
        options.complete();
      }
    }
  };

  return ajaxOptions;
}

/**
 * @description Poll over an interval of time
 * @param {{interval?: number}} options
 * @returns {(handler: (resolve: (proceed: boolean) => void) => void, complete: () => void) => void}
 */
const poll = (options: { interval?: number, complete?: () => void } = {}) => {
  const interval = options.interval || 0;
  const complete = isFunc(options.complete) ? options.complete : () => true;
  return (handler: (resolve: (proceed: boolean) => void) => void) => {
    setTimeout(() => {
      handler((proceed: boolean) => {
        if (proceed) {
          return poll({interval, complete})(handler);
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
const filterObjectData = (objectData: any, requiredKeys: any) => {
  const filteredObject = {};
  eachKey(objectData, (key, value) => {
    if (requiredKeys.indexOf(key) === -1) {
      return false;
    }
    (filteredObject as any)[key] = value;
  });
  return filteredObject;
};

/**
 * @description Filter array of objects data
 * @param arrayData
 * @param requiredKeys
 */
const filterArrayOfObjectsData = (arrayData: any, requiredKeys: any) => {
  return arrayData.reduce((accumulator: any, item: any) => {
    const filteredObject = filterObjectData(item, requiredKeys);
    accumulator.push(filteredObject);
    return accumulator;
  }, []);
}

/**
 * @description Pluck object data to array
 * @param objectData
 * @param requiredKey
 */
const pluckObjectDataToArray = (objectData: any, requiredKey: any) => {
  const filteredArray: any = [];
  eachKey(objectData, (key, value) => {
    if (requiredKey !== key) {
      return false;
    }
    filteredArray.push(value);
  });
  return filteredArray;
}

/**
 * @description Pluck array of objects data to array
 * @param arrayData
 * @param requiredKey
 */
const pluckArrayOfObjectsDataToArray = (arrayData: any, requiredKey: any) => {
  return arrayData.reduce((accumulator: any, item: any) => {
    const filteredArray = pluckObjectDataToArray(item, requiredKey);
    accumulator = [...accumulator, ...filteredArray];
    return accumulator;
  }, []);
}

/**
 * @description Ajax handler
 * @param options
 */
const ajax = (options: IAjaxOptions) => {
  const ajaxOptions = getAjaxOptions(options);
  return $.ajax(ajaxOptions);
}

/**
 * @description Reactive ajax
 * @param options
 */
export default function reactiveAjax(options: IAjaxOptions) {
  const assign = (Object as any).assign;
  const originalOptions = assign({}, options);
  let modifiedOptions: IAjaxOptions = assign({}, originalOptions);
  let isRequestFullfilled = false;
  let isRequestAborted = false;
  let request: any;
  const requestTime = {
    start: -1,
    end: -1,
    duration: -1
  };

  /**
   * @description Get request time
   * @returns {number}
   */
  const getRequestTime = () => requestTime.end - requestTime.start;

  /**
   * @description Get request elapsed time
   * @returns {number}
   */
  const getRequestElapsedTime = () => new Date().getTime() - requestTime.start;

  /**
   * @description Get request duration
   * @returns {number}
   */
  const getRequestDuration = () => requestTime.duration = requestTime.end - requestTime.start;

  /**
   * @description Get request end time
   */
  const getRequestEndTime = () => requestTime.end = new Date().getTime();

  /**
   * @description Normalize callback
   */
  const normalizeCallback = () => {
    modifiedOptions = assign(modifiedOptions, {
      callback(err: any, res: any) {
        getRequestEndTime();
        getRequestDuration();
        let filteredData;
        if (isRequestAborted) {
          return false;
        }
        isRequestFullfilled = true;
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
     * @@description Extract
     * @param filters
     */
    extract(filters: string[]) {
      options.callback = (err, res) => {
        getRequestEndTime();
        getRequestDuration();
        let filteredData;
        if (isRequestAborted) {
          return false;
        }
        isRequestFullfilled = true;
        if (err) {
          return options.callback(err);
        }

        if (isObj(res)) {
          filteredData = filterObjectData(res, filters);
        } else if (isArr(res) && isObj(res[0])) {
          filteredData = filterArrayOfObjectsData(res, filters);
        }

        originalOptions.callback(undefined, filteredData);
      };
      modifiedOptions = assign({}, options);
      return this;
    },
    /**
     * @description Filter
     * @param {() => void} handler
     */
    filter(handler: (item: any, index?: number) => void) {
      options.callback = (err, res) => {
        getRequestEndTime();
        getRequestDuration();
        let filteredData;
        if (isRequestAborted) {
          return false;
        }
        isRequestFullfilled = true;
        if (err) {
          return options.callback(err);
        }

        if (isArr(res)) {
          filteredData = res.filter(handler);
        }

        originalOptions.callback(undefined, filteredData);
      }
      modifiedOptions = assign({}, options);
      return this;
    },
    /**
     * @description Pluck
     * @param filterKey
     */
    pluck(filterKey: string) {
      options.callback = (err, res) => {
        getRequestEndTime();
        getRequestDuration();
        let filteredData;
        if (isRequestAborted) {
          return false;
        }
        isRequestFullfilled = true;
        if (err) {
          return options.callback(err);
        }

        if (isObj(res)) {
          filteredData = pluckObjectDataToArray(res, filterKey);
        } else if (isArr(res) && isObj(res[0])) {
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
    watch(handler: any, complete = (options: { isRequestFullfilled: boolean, isRequestAborted: boolean, requestTime: any }) => {
    }, interval = 100) {
      const watcher = poll({
        interval,
        complete: () => complete({ isRequestFullfilled, isRequestAborted, requestTime })
      });
      watcher(resolve => {
        handler(resolve, {
          isRequestFullfilled,
          getRequestElapsedTime
        }, function abort() {
          if (isRequestFullfilled) {
            return false;
          }
          isRequestAborted = true;
          request.abort();
          requestTime.end = new Date().getTime();
          resolve(false);
        })
      });
      return this;
    },
    /**
     * @description Run
     */
    run() {
      requestTime.start = new Date().getTime();
      request = ajax(modifiedOptions);
      return this;
    },
  }
}
