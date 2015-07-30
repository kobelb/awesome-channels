/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _Channel = __webpack_require__(1);

	var _Channel2 = _interopRequireDefault(_Channel);

	exports.Channel = _Channel2['default'];

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {"use strict";

	module.exports = global["Channel"] = __webpack_require__(2);
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	var _uuid = __webpack_require__(3);

	var _uuid2 = _interopRequireDefault(_uuid);

	var _processMessageOnce = __webpack_require__(5);

	var _processMessageOnce2 = _interopRequireDefault(_processMessageOnce);

	var _propagator = __webpack_require__(6);

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

	    // if the following occurs, we're running on the server and communication on the server isn't supported
	    if (typeof window === 'undefined') {
	      return;
	    }

	    this._namespace = namespace;
	    this._targetOrigin = '*';
	    this._subscribers = {};
	    this._methodCallbacks = {};
	    this._methods = {};
	    window.addEventListener('message', (0, _processMessageOnce2['default'])(this._onWindowMessage.bind(this)));
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

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	//     uuid.js
	//
	//     Copyright (c) 2010-2012 Robert Kieffer
	//     MIT License - http://opensource.org/licenses/mit-license.php

	// Unique ID creation requires a high quality random # generator.  We feature
	// detect to determine the best RNG source, normalizing to a function that
	// returns 128-bits of randomness, since that's what's usually required
	var _rng = __webpack_require__(4);

	// Maps for number <-> hex string conversion
	var _byteToHex = [];
	var _hexToByte = {};
	for (var i = 0; i < 256; i++) {
	  _byteToHex[i] = (i + 0x100).toString(16).substr(1);
	  _hexToByte[_byteToHex[i]] = i;
	}

	// **`parse()` - Parse a UUID into it's component bytes**
	function parse(s, buf, offset) {
	  var i = (buf && offset) || 0, ii = 0;

	  buf = buf || [];
	  s.toLowerCase().replace(/[0-9a-f]{2}/g, function(oct) {
	    if (ii < 16) { // Don't overflow!
	      buf[i + ii++] = _hexToByte[oct];
	    }
	  });

	  // Zero out remaining bytes if string was short
	  while (ii < 16) {
	    buf[i + ii++] = 0;
	  }

	  return buf;
	}

	// **`unparse()` - Convert UUID byte array (ala parse()) into a string**
	function unparse(buf, offset) {
	  var i = offset || 0, bth = _byteToHex;
	  return  bth[buf[i++]] + bth[buf[i++]] +
	          bth[buf[i++]] + bth[buf[i++]] + '-' +
	          bth[buf[i++]] + bth[buf[i++]] + '-' +
	          bth[buf[i++]] + bth[buf[i++]] + '-' +
	          bth[buf[i++]] + bth[buf[i++]] + '-' +
	          bth[buf[i++]] + bth[buf[i++]] +
	          bth[buf[i++]] + bth[buf[i++]] +
	          bth[buf[i++]] + bth[buf[i++]];
	}

	// **`v1()` - Generate time-based UUID**
	//
	// Inspired by https://github.com/LiosK/UUID.js
	// and http://docs.python.org/library/uuid.html

	// random #'s we need to init node and clockseq
	var _seedBytes = _rng();

	// Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
	var _nodeId = [
	  _seedBytes[0] | 0x01,
	  _seedBytes[1], _seedBytes[2], _seedBytes[3], _seedBytes[4], _seedBytes[5]
	];

	// Per 4.2.2, randomize (14 bit) clockseq
	var _clockseq = (_seedBytes[6] << 8 | _seedBytes[7]) & 0x3fff;

	// Previous uuid creation time
	var _lastMSecs = 0, _lastNSecs = 0;

	// See https://github.com/broofa/node-uuid for API details
	function v1(options, buf, offset) {
	  var i = buf && offset || 0;
	  var b = buf || [];

	  options = options || {};

	  var clockseq = options.clockseq !== undefined ? options.clockseq : _clockseq;

	  // UUID timestamps are 100 nano-second units since the Gregorian epoch,
	  // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
	  // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
	  // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.
	  var msecs = options.msecs !== undefined ? options.msecs : new Date().getTime();

	  // Per 4.2.1.2, use count of uuid's generated during the current clock
	  // cycle to simulate higher resolution clock
	  var nsecs = options.nsecs !== undefined ? options.nsecs : _lastNSecs + 1;

	  // Time since last uuid creation (in msecs)
	  var dt = (msecs - _lastMSecs) + (nsecs - _lastNSecs)/10000;

	  // Per 4.2.1.2, Bump clockseq on clock regression
	  if (dt < 0 && options.clockseq === undefined) {
	    clockseq = clockseq + 1 & 0x3fff;
	  }

	  // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
	  // time interval
	  if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === undefined) {
	    nsecs = 0;
	  }

	  // Per 4.2.1.2 Throw error if too many uuids are requested
	  if (nsecs >= 10000) {
	    throw new Error('uuid.v1(): Can\'t create more than 10M uuids/sec');
	  }

	  _lastMSecs = msecs;
	  _lastNSecs = nsecs;
	  _clockseq = clockseq;

	  // Per 4.1.4 - Convert from unix epoch to Gregorian epoch
	  msecs += 12219292800000;

	  // `time_low`
	  var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
	  b[i++] = tl >>> 24 & 0xff;
	  b[i++] = tl >>> 16 & 0xff;
	  b[i++] = tl >>> 8 & 0xff;
	  b[i++] = tl & 0xff;

	  // `time_mid`
	  var tmh = (msecs / 0x100000000 * 10000) & 0xfffffff;
	  b[i++] = tmh >>> 8 & 0xff;
	  b[i++] = tmh & 0xff;

	  // `time_high_and_version`
	  b[i++] = tmh >>> 24 & 0xf | 0x10; // include version
	  b[i++] = tmh >>> 16 & 0xff;

	  // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)
	  b[i++] = clockseq >>> 8 | 0x80;

	  // `clock_seq_low`
	  b[i++] = clockseq & 0xff;

	  // `node`
	  var node = options.node || _nodeId;
	  for (var n = 0; n < 6; n++) {
	    b[i + n] = node[n];
	  }

	  return buf ? buf : unparse(b);
	}

	// **`v4()` - Generate random UUID**

	// See https://github.com/broofa/node-uuid for API details
	function v4(options, buf, offset) {
	  // Deprecated - 'format' argument, as supported in v1.2
	  var i = buf && offset || 0;

	  if (typeof(options) == 'string') {
	    buf = options == 'binary' ? new Array(16) : null;
	    options = null;
	  }
	  options = options || {};

	  var rnds = options.random || (options.rng || _rng)();

	  // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
	  rnds[6] = (rnds[6] & 0x0f) | 0x40;
	  rnds[8] = (rnds[8] & 0x3f) | 0x80;

	  // Copy bytes to buffer, if provided
	  if (buf) {
	    for (var ii = 0; ii < 16; ii++) {
	      buf[i + ii] = rnds[ii];
	    }
	  }

	  return buf || unparse(rnds);
	}

	// Export public API
	var uuid = v4;
	uuid.v1 = v1;
	uuid.v4 = v4;
	uuid.parse = parse;
	uuid.unparse = unparse;

	module.exports = uuid;


/***/ },
/* 4 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {
	var rng;

	if (global.crypto && crypto.getRandomValues) {
	  // WHATWG crypto-based RNG - http://wiki.whatwg.org/wiki/Crypto
	  // Moderately fast, high quality
	  var _rnds8 = new Uint8Array(16);
	  rng = function whatwgRNG() {
	    crypto.getRandomValues(_rnds8);
	    return _rnds8;
	  };
	}

	if (!rng) {
	  // Math.random()-based (RNG)
	  //
	  // If all else fails, use Math.random().  It's fast, but is of unspecified
	  // quality.
	  var  _rnds = new Array(16);
	  rng = function() {
	    for (var i = 0, r; i < 16; i++) {
	      if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
	      _rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
	    }

	    return _rnds;
	  };
	}

	module.exports = rng;


	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _uuid = __webpack_require__(3);

	var _uuid2 = _interopRequireDefault(_uuid);

	exports['default'] = function (callback) {
	  var maxLength = 2;

	  var messageIds = [];

	  return function (e) {
	    // if the message isn't an object, we can't do anything because we have to track this
	    // message to see if we've seen it before
	    if (typeof e.data !== 'object') {
	      return;
	    }

	    if (!e.data.id) {
	      e.data.id = _uuid2['default'].v4();
	    }

	    if (messageIds.indexOf(e.data.id) > -1) {
	      return;
	    }

	    // only keeping track of a certain number of messages so we don't use up all the memory
	    messageIds.unshift(e.data.id);
	    if (messageIds.length > maxLength) {
	      messageIds.pop();
	    }

	    console.log(messageIds);
	    callback(e);
	  };
	};

	module.exports = exports['default'];

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	var _processMessageOnce = __webpack_require__(5);

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

/***/ }
/******/ ]);