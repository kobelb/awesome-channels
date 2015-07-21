'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Propagator = (function () {
  function Propagator() {
    _classCallCheck(this, Propagator);

    this._targetOrigin = '*';
    window.addEventListener('message', this.onMessage.bind(this));
  }

  _createClass(Propagator, [{
    key: 'onMessage',
    value: function onMessage(e) {
      var _this = this;

      var payload = e.data;

      // if the message isn't an object, we can't propagate it.
      // everything coming from the channel is an object
      if (typeof e.data !== 'object') {
        return;
      }

      // if this is the first time the propagator has seen the message
      // then we initialize the receivedLocations
      if (payload.receivedLocations == null) {
        payload.receivedLocations = [window.location.href];
      }

      var hasntReceivedMessage = function hasntReceivedMessage(w) {
        return payload.receivedLocations.indexOf(w.location.href) === -1;
      };

      var propagators = [];
      var willReceiveMessage = function willReceiveMessage(w) {
        payload.receivedLocations.push(w.location.href);
        propagators.push(w);
      };

      // check downstream
      Array.prototype.forEach.call(document.querySelectorAll('iframe'), function (iframe) {
        if (hasntReceivedMessage(iframe.contentWindow)) {
          willReceiveMessage(iframe.contentWindow);
        }
      });

      // check upstream
      if (hasntReceivedMessage(window.parent)) {
        willReceiveMessage(window.parent);
      }

      //propagate
      propagators.forEach(function (p) {
        p.postMessage(payload, _this._targetOrigin);
      });
    }
  }]);

  return Propagator;
})();

exports['default'] = {
  initialize: function initialize() {
    if (!window.propagator) {
      window.propagator = new Propagator();
    }
  }
};
module.exports = exports['default'];