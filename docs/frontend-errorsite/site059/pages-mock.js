(function () {
  var originalFetch = window.fetch.bind(window);
  window.fetch = function (input, init) {
    var rawUrl = typeof input === 'string' ? input : input && input.url;
    if (rawUrl && rawUrl.indexOf('/api/') === 0) {
      var source = new URL(rawUrl, window.location.origin);
      var target = new URL('./api/' + source.pathname.replace(/^\/api\//, ''), window.location.href);
      target.search = source.search;
      return new Promise(function (resolve, reject) {
        window.setTimeout(function () {
          originalFetch(target.href, init).then(resolve, reject);
        }, 250);
      });
    }
    return originalFetch(input, init);
  };
}());
