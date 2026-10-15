// Injected into webpack's runtime, before any application imports execute.
(function () {
  var ensureChunk = __webpack_require__.e;
  var loadScript = __webpack_require__.l;
  var pending = Object.create(null);
  var retrying = Object.create(null);

  function report(action, id) {
    if (typeof window !== 'undefined' && window.__ERIDANUS_ASSETS__) {
      window.__ERIDANUS_ASSETS__[action]('chunk:' + id);
    }
  }

  __webpack_require__.l = function (url, done, key, chunkId) {
    if (retrying[chunkId]) {
      url += (url.indexOf('?') === -1 ? '?' : '&') + '__asset_retry=' + Date.now();
    }
    return loadScript.call(this, url, done, key, chunkId);
  };

  __webpack_require__.e = function (chunkId) {
    // Concurrent imports share both attempts, including the retry delay.
    if (pending[chunkId]) return pending[chunkId];
    report('begin', chunkId);
    var promise = ensureChunk(chunkId)
      .catch(function (error) {
        // Application exceptions are never retried as network failures.
        if (!error || error.name !== 'ChunkLoadError') throw error;
        retrying[chunkId] = true;
        report('retry', chunkId);
        return new Promise(function (resolve) {
          setTimeout(resolve, 1000);
        }).then(function () {
          return ensureChunk(chunkId);
        });
      })
      .then(
        function () {
          delete retrying[chunkId];
          delete pending[chunkId];
          report('end', chunkId);
        },
        function (error) {
          delete retrying[chunkId];
          // Retain the rejection so later consumers cannot start endless retries.
          report(error && error.name === 'ChunkLoadError' ? 'fail' : 'end', chunkId);
          throw error;
        },
      );
    pending[chunkId] = promise;
    return promise;
  };
})();
