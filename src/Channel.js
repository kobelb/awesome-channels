import uuid from 'uuid';
import processMessageOnce from './processMessageOnce';
import propagator from './propagator';
propagator.initialize();

const MESSAGE_TYPE = 'channels:message';
const METHOD_CALL_TYPE = 'channels:method:call';
const METHOD_RESPONSE_TYPE = 'channels:method:response';

class Channel {

  _onMessage (payload) {
    const subscribers = this._subscribers[payload.eventName];
    if (!subscribers) {
      return;
    }

    Array.prototype.forEach.call(subscribers, function (cb) {
      cb(payload.message);
    });
  }

  _onMethodCall ({methodName, args, instanceId}) {
    const method = this._methods[methodName];

    if (!method) {
      return;
    }

    const response = method(...args);

    window.postMessage({
      type: METHOD_RESPONSE_TYPE,
      namespace: this._namespace,
      instanceId,
      response
    }, this._targetOrigin);
  }

  _onMethodResponse ({instanceId, response}) {
    const methodCallback = this._methodCallbacks[instanceId];

    if (!methodCallback) {
      return;
    }

    methodCallback(response);

    delete this._methodCallbacks[instanceId];
  }

  _onWindowMessage (e) {
    let payload = e.data;

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

  constructor (namespace) {
    // if the following occurs, we're running on the server and communication on the server isn't supported
    if (typeof window === 'undefined') {
      return;
    }

    this._namespace = namespace;
    this._targetOrigin = '*';
    this._subscribers = {};
    this._methodCallbacks = {};
    this._methods = {};
    window.addEventListener('message', processMessageOnce(this._onWindowMessage.bind(this)));
  }

  call (methodName, cb, ...args) {
    let payload = {
      type: METHOD_CALL_TYPE,
      namespace: this._namespace,
      instanceId: uuid.v4(),
      methodName: methodName,
      args: args
    };

    this._methodCallbacks[payload.instanceId] = cb;
    window.postMessage(payload, this._targetOrigin);
    return payload.instanceId;
  }

  callWithTimeout (methodName, cb, timeout, ...args) {
    const instanceId = this.call(methodName, (response) => {
      cb.apply(null, [true, response]);
    }, args);

    setTimeout(() => {
      if (this._methodCallbacks[instanceId]) {
        delete this._methodCallbacks[instanceId];
        cb(false);
      }
    }, timeout);
  }

  emit (eventName, message) {
    let payload = {
      type: MESSAGE_TYPE,
      namespace: this._namespace,
      eventName,
      message
    };

    window.postMessage(payload, this._targetOrigin);
  }

  on (eventName, cb) {
    if (!this._subscribers[eventName]) {
      this._subscribers[eventName] = [];
    }

    this._subscribers[eventName].push(cb);
  }

  register (methodName, cb) {
    if (this._methods[methodName]) {
      throw new Error(`Something/someone else has already registered the method '${methodName}' on this channel instance`);
    }

    this._methods[methodName] = cb;
  }
}

export default Channel;