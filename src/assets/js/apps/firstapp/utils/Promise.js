"use strict";
/*jshint -W018, -W040, -W064, -W083, -W086 */

export async
function performRouteHandlerStaticMethod(routes, methodName, ...args) {
    return Promise.all(routes
        .map(route => route.handler[methodName])
        .filter(method => typeof method === 'function')
        .map(method => method(...args))
    );
}

/*

      let stat = PromiseUtils.retry({
        what: () => httpRequest
          .get(`https://api.github.com/repos/${ownerName}/${repoName}/stats/commit_activity`)
          .exec(),
        when: (resp, counter) => (resp.status == 202 && counter < 3),
        wait: (counter) => counter*1000
      })
      .then((resp) => resp.body);

*/

export class PromiseUtils {

    constructor() {}

    static retry(options) {

        var c = 1,
            promise = options.what,
            predicate = options.when,
            timeout = options.wait;

        var innerPromiseWhile = (promise, predicate, timeout, counter) => {
            return new Promise((resolve, reject) => {
                promise()
                    .then((val) => {
                        if (predicate(val, counter)) {
                            setTimeout(() => {
                                return innerPromiseWhile(promise, predicate, timeout, counter + 1)
                                    .then((val1) => resolve(val1), (err1) => reject(err1))
                            }, timeout(counter));
                        } else {
                            resolve(val)
                        }
                    }, (err) => reject(err))
            })
        }

        return innerPromiseWhile(promise, predicate, timeout, c);

    }
}