(function () {
})();

window.trigger = function (message) {
  var iframes = document.querySelectorAll('iframe');
  Array.prototype.forEach.call(iframes, function (iframe) {
    iframe.contentWindow.postMessage(message, '*');
  });

  if (window.parent) {
    window.parent.postMessage(message, '*');
  }

};