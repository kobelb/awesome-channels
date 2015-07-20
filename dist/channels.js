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

	/* WEBPACK VAR INJECTION */(function(global) {"use strict";

	module.exports = global["Channel"] = __webpack_require__(1);
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	var _propagator = __webpack_require__(2);

	var _propagator2 = _interopRequireDefault(_propagator);

	_propagator2['default'].initialize();

	var Channel = (function () {
	  _createClass(Channel, [{
	    key: '_dispatchMessage',
	    value: function _dispatchMessage(message) {
	      Array.prototype.forEach.call(this._subscribers, function (cb) {
	        cb(message);
	      });
	    }
	  }, {
	    key: '_onMessage',
	    value: function _onMessage(e) {
	      var payload = e.data;

	      if (payload.namespace !== this._namespace) return;

	      this._dispatchMessage(payload.message);
	    }
	  }]);

	  function Channel(namespace) {
	    _classCallCheck(this, Channel);

	    this._namespace = namespace;
	    this._targetOrigin = '*';
	    this._subscribers = [];
	    window.addEventListener('message', this._onMessage.bind(this));
	  }

	  _createClass(Channel, [{
	    key: 'trigger',
	    value: function trigger(message) {
	      var payload = {
	        namespace: this._namespace,
	        message: message
	      };

	      window.postMessage(payload, this._targetOrigin);
	    }
	  }, {
	    key: 'on',
	    value: function on(cb) {
	      this._subscribers.push(cb);
	    }
	  }]);

	  return Channel;
	})();

	exports['default'] = Channel;
	module.exports = exports['default'];

/***/ },
/* 2 */
/***/ function(module, exports) {

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

/***/ }
/******/ ]);