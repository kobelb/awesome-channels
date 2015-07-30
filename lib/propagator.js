'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _processMessageOnce = require('./processMessageOnce');

var _processMessageOnce2 = _interopRequireDefault(_processMessageOnce);

var Propagator = (function () {
  function Propagator() {
    _classCallCheck(this, Propagator);

    this._targetOrigin = '*';
    window.addEventListener('message', (0, _processMessageOnce2['default'])(this.onMessage.bind(this)));
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

      var propagators = [];

      // check downstream
      Array.prototype.forEach.call(document.querySelectorAll('iframe'), function (iframe) {
        propagators.push(iframe.contentWindow);
      });

      // check upstream
      if (window.parent) {
        propagators.push(window.parent);
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
    if (typeof window === 'undefined') {
      return;
    }

    if (!window.propagator) {
      window.propagator = new Propagator();
    }
  }
};
module.exports = exports['default'];