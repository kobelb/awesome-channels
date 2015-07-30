'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

exports['default'] = function (callback) {
  var maxLength = 100;

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

    callback(e);
  };
};

module.exports = exports['default'];