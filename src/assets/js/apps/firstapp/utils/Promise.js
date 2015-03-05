"use strict";
/*jshint -W018, -W040, -W064, -W083, -W086 */

export async function performRouteHandlerStaticMethod(routes, methodName, ...args) {
  return Promise.all(routes
    .map(route => route.handler[methodName])
    .filter(method => typeof method === 'function')
    .map(method => method(...args))
    );
}

/*

    var myPromise = () => Promise.resolve('qwe');
    promiseWhile(myPromise, (val, counter) => (counter<2), (counter) => (counter* 500));

*/

export function retryWhile (promise, predicate, timeout) {

  var c = 1;
  
  var innerPromiseWhile = (promise, predicate, timeout, counter) => { 
    return new Promise ((resolve, reject) => {
      promise()
      .then((val) => {
        if (predicate(val, counter)) {
          setTimeout(() => {
            return innerPromiseWhile(promise, predicate, timeout, counter+1)
                .then((val1) => resolve(val1), (err1) => reject(err1))
          }, timeout(counter));
        } else {
          resolve(val)
        }
      }, (err) => reject(err))
    })
  }

  return innerPromiseWhile(promise, predicate, timeout, c)
}

// urgly
Promise.prototype.flatMap = function(lambda) {
    let that = this;
    return new Promise((resolve, reject) => {
        that.then((val) => {
            try {
                let answer = lambda(val);
                if (answer.toString() === '[object Promise]') {
                    answer.then((val1) => resolve(val1), (err1) => reject(err1))
                } else {
                    resolve(answer)
                }
            } catch (err) {
                reject(err);
            }
        }, (err) => reject(err));

    })
};

