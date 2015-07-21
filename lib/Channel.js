'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _propagator = require('./propagator');

var _propagator2 = _interopRequireDefault(_propagator);

_propagator2['default'].initialize();

var MESSAGE_TYPE = 'channels:message';
var METHOD_CALL_TYPE = 'channels:method:call';
var METHOD_RESPONSE_TYPE = 'channels:method:response';

var Channel = (function () {
  _createClass(Channel, [{
    key: '_onMessage',
    value: function _onMessage(payload) {
      var subscribers = this._subscribers[payload.eventName];
      if (!subscribers) {
        return;
      }

      Array.prototype.forEach.call(subscribers, function (cb) {
        cb(payload.message);
      });
    }
  }, {
    key: '_onMethodCall',
    value: function _onMethodCall(_ref) {
      var methodName = _ref.methodName;
      var args = _ref.args;
      var instanceId = _ref.instanceId;

      var method = this._methods[methodName];

      if (!method) {
        return;
      }

      var response = method.apply(undefined, _toConsumableArray(args));

      window.postMessage({
        type: METHOD_RESPONSE_TYPE,
        namespace: this._namespace,
        instanceId: instanceId,
        response: response
      }, this._targetOrigin);
    }
  }, {
    key: '_onMethodResponse',
    value: function _onMethodResponse(_ref2) {
      var instanceId = _ref2.instanceId;
      var response = _ref2.response;

      var methodCallback = this._methodCallbacks[instanceId];

      if (!methodCallback) {
        return;
      }

      methodCallback(response);

      delete methodCallback[instanceId];
    }
  }, {
    key: '_onWindowMessage',
    value: function _onWindowMessage(e) {
      var payload = e.data;

      // all of our messages are objects
      if (typeof payload !== 'object') {
        return;
      }

      if (this._namespace !== payload.namespace) {
        return;
      }

      if (payload.type === MESSAGE_TYPE) {
        return this._onMessage(payload);
      }

      if (payload.type === METHOD_CALL_TYPE) {
        return this._onMethodCall(payload);
      }

      if (payload.type === METHOD_RESPONSE_TYPE) {
        return this._onMethodResponse(payload);
      }
    }
  }]);

  function Channel(namespace) {
    _classCallCheck(this, Channel);

    this._namespace = namespace;
    this._targetOrigin = '*';
    this._subscribers = {};
    this._methodCallbacks = {};
    this._methods = {};
    window.addEventListener('message', this._onWindowMessage.bind(this));
  }

  _createClass(Channel, [{
    key: 'call',
    value: function call(methodName, cb) {
      for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        args[_key - 2] = arguments[_key];
      }

      var payload = {
        type: METHOD_CALL_TYPE,
        namespace: this._namespace,
        instanceId: _uuid2['default'].v4(),
        methodName: methodName,
        args: args
      };

      this._methodCallbacks[payload.instanceId] = cb;
      window.postMessage(payload, this._targetOrigin);
    }
  }, {
    key: 'emit',
    value: function emit(eventName, message) {
      var payload = {
        type: MESSAGE_TYPE,
        namespace: this._namespace,
        eventName: eventName,
        message: message
      };

      window.postMessage(payload, this._targetOrigin);
    }
  }, {
    key: 'on',
    value: function on(eventName, cb) {
      if (!this._subscribers[eventName]) {
        this._subscribers[eventName] = [];
      }

      this._subscribers[eventName].push(cb);
    }
  }, {
    key: 'register',
    value: function register(methodName, cb) {
      if (this._methods[methodName]) {
        throw new Error('Something/someone else has already registered the method \'' + methodName + '\' on this channel instance');
      }

      this._methods[methodName] = cb;
    }
  }]);

  return Channel;
})();

exports['default'] = Channel;
module.exports = exports['default'];